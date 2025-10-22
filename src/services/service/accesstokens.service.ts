import { service, user, company } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { generateTokenString } from "@utils/helpers";
import { Page, QueryBuilder, Transaction, raw } from "objection";

type TokenStatusValue = "ACTIVE" | "REVOKED" | "EXPIRED";
type ApiScopeAccessValue = "READ" | "WRITE" | "DELETE" | "UPDATE" | "MANAGE" | "*";

type CreateAccessTokenInput = {
  company_id?: string | null;
  user_id?: string | null;
  expired_at?: string | null;
  api_scope_ids?: number[];
};
type UpdateAccessTokenInput = Partial<Pick<service.AccessTokens, "status" | "expired_at">>;
type TokenRelationParams = { withScopes?: boolean; withUser?: boolean; withCompany?: boolean };

interface FindAllAccessTokensOptions {
  limit: number;
  offset: number;
  company_id?: string;
  user_id?: string;
  status?: TokenStatusValue;
  sort?: string;
  withScopes?: boolean;
  withUser?: boolean;
  withCompany?: boolean;
}

export class AccessTokensService {
  async findAll({
    limit,
    offset,
    company_id,
    user_id,
    status,
    sort,
    withScopes,
    withUser,
    withCompany,
  }: FindAllAccessTokensOptions): Promise<Page<service.AccessTokens>> {
    let query = service.AccessTokens.query().whereNull("deleted_at");

    if (company_id) query = query.where("company_id", company_id);
    if (user_id) query = query.where("user_id", user_id);
    if (status) query = query.where("status", status);

    if (sort) {
      const [column, direction] = sort.split(":");

      const allowedSortColumns = [
        "id",
        "company_id",
        "user_id",
        "status",
        "expired_at",
        "created_at",
      ];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("created_at", "DESC");
    }

    const eagerGraph: Record<string, any> = {};
    if (withScopes) {
      eagerGraph.scopes = { $modify: ["selectIdAccessModule"] };
    }
    if (withUser) {
      eagerGraph.user = { $modify: ["selectBasicUserInfo"] };
    }
    if (withCompany) {
      eagerGraph.company = { $modify: ["selectBasicCompanyInfo"] };
    }

    const modifiers = {
      selectIdAccessModule: (builder: QueryBuilder<service.ApiScopes>) => {
        builder
          .select("id", "access", "description", "module_id")
          .withGraphFetched("module(selectIdName)")
          .modifiers({
            selectIdName: (moduleBuilder: QueryBuilder<service.Modules>) => {
              moduleBuilder.select("id", "name");
            },
          });
      },
      selectBasicUserInfo: (builder: QueryBuilder<user.Users>) => {
        builder.select("id", "name", "email");
      },
      selectBasicCompanyInfo: (builder: QueryBuilder<company.Companies>) => {
        builder.select("id", "name", "company_code");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const tokensPage: Page<service.AccessTokens> = await query.page(page, limit);
    return tokensPage;
  }

  async findOne(
    id: string,
    { withScopes, withUser, withCompany }: TokenRelationParams = {}
  ): Promise<service.AccessTokens> {
    let query = service.AccessTokens.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    if (withScopes) eagerGraph.scopes = { $modify: ["selectIdAccessModule"] };
    if (withUser) eagerGraph.user = { $modify: ["selectBasicUserInfo"] };
    if (withCompany) eagerGraph.company = { $modify: ["selectBasicCompanyInfo"] };

    const modifiers = {
      selectIdAccessModule: (builder: QueryBuilder<service.ApiScopes>) => {
        builder
          .select("id", "access", "description", "module_id")
          .withGraphFetched("module(selectIdName)")
          .modifiers({
            selectIdName: (mb: QueryBuilder<service.Modules>) => mb.select("id", "name"),
          });
      },
      selectBasicUserInfo: (builder: QueryBuilder<user.Users>) => {
        builder.select("id", "name", "email");
      },
      selectBasicCompanyInfo: (builder: QueryBuilder<company.Companies>) => {
        builder.select("id", "name", "company_code");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const accessToken = await query;
    if (!accessToken) {
      throw new NotFoundError(`Access Token with ID ${id} not found`);
    }
    return accessToken;
  }

  async create(data: CreateAccessTokenInput, trx?: Transaction): Promise<service.AccessTokens> {
    if (data.user_id) {
      const userExists = await user.Users.query(trx).findById(data.user_id).whereNull("deleted_at");
      if (!userExists) throw new BadRequestError(`User with ID ${data.user_id} not found.`);
    }
    if (data.company_id) {
      const companyExists = await company.Companies.query(trx)
        .findById(data.company_id)
        .whereNull("deleted_at");
      if (!companyExists)
        throw new BadRequestError(`Company with ID ${data.company_id} not found.`);
    }

    let scopes: service.ApiScopes[] = [];
    if (data.api_scope_ids && data.api_scope_ids.length > 0) {
      scopes = await service.ApiScopes.query(trx).findByIds(data.api_scope_ids);
      if (scopes.length !== data.api_scope_ids.length) {
        throw new BadRequestError("One or more provided API Scope IDs are invalid.");
      }
    } else {
      throw new BadRequestError("At least one API Scope ID is required.");
    }

    const newTokenData: Partial<service.AccessTokens> = {
      token: generateTokenString(),
      company_id: data.company_id as string,
      user_id: data.user_id as string,
      status: "ACTIVE",
      expired_at: data.expired_at || null,
    };

    const newAccessToken = await service.AccessTokens.query(trx)
      .insert(newTokenData)
      .returning("*");
    const tokenInstance = Array.isArray(newAccessToken) ? newAccessToken[0] : newAccessToken;

    if (tokenInstance && scopes.length > 0) {
      await tokenInstance.$relatedQuery("scopes", trx).relate(scopes.map((s) => s.id));
    }

    return tokenInstance;
  }

  async update(
    id: string,
    data: UpdateAccessTokenInput,
    trx?: Transaction
  ): Promise<service.AccessTokens> {
    const accessToken = await service.AccessTokens.query(trx).findById(id).whereNull("deleted_at");
    if (!accessToken) {
      throw new NotFoundError(`Access Token with ID ${id} not found`);
    }

    const updatedTokens = await accessToken.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedTokens) ? updatedTokens[0] : updatedTokens;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const accessToken = await service.AccessTokens.query(trx).findById(id).whereNull("deleted_at");
    if (!accessToken) {
      throw new NotFoundError(`Access Token with ID ${id} not found`);
    }

    await accessToken.$query(trx).patch({ deleted_at: new Date().toISOString() });

    return { message: `Access Token with ID ${id} deleted (or revoked) successfully` };
  }
}

export default new AccessTokensService();
