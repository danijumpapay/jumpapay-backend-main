import { service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateTokenScopeInput = Pick<service.TokenScopes, "access_token_id" | "api_scope_id">;

interface FindAllTokenScopesOptions {
  limit: number;
  offset: number;
  access_token_id?: string;
  api_scope_id?: number;
}

export class TokenScopesService {
  async findAll({
    limit,
    offset,
    access_token_id,
    api_scope_id,
  }: FindAllTokenScopesOptions): Promise<Page<service.TokenScopes>> {
    let query = service.TokenScopes.query();

    if (access_token_id) {
      query = query.where("access_token_id", access_token_id);
    }
    if (api_scope_id) {
      query = query.where("api_scope_id", api_scope_id);
    }

    query = query.withGraphFetched("[accessToken(selectBasicToken), apiScope(selectScopeDetails)]");

    const modifiers = {
      selectBasicToken: (builder: QueryBuilder<service.AccessTokens>) => {
        builder.select("id", "status", "expired_at").whereNull("deleted_at");
      },
      selectScopeDetails: (builder: QueryBuilder<service.ApiScopes>) => {
        builder
          .select("id", "access", "description", "module_id")
          .withGraphFetched("module(selectIdName)")
          .modifiers({
            selectIdName: (moduleBuilder: QueryBuilder<service.Modules>) => {
              moduleBuilder.select("id", "name");
            },
          });
      },
    };
    query = query.modifiers(modifiers);

    query = query.orderBy("access_token_id", "ASC").orderBy("api_scope_id", "ASC");

    const page = Math.floor(offset / limit);
    const tokenScopesPage: Page<service.TokenScopes> = await query.page(page, limit);
    return tokenScopesPage;
  }

  async findOne(
    access_token_id: string,
    api_scope_id: number,
    trx?: Transaction
  ): Promise<service.TokenScopes> {
    const relation = await service.TokenScopes.query(trx)
      .where({ access_token_id, api_scope_id })
      .withGraphFetched("[accessToken(selectBasicToken), apiScope(selectScopeDetails)]")
      .modifiers({
        selectBasicToken: (builder: QueryBuilder<service.AccessTokens>) => {
          builder.select("id", "status", "expired_at").whereNull("deleted_at");
        },
        selectScopeDetails: (builder: QueryBuilder<service.ApiScopes>) => {
          builder
            .select("id", "access", "description", "module_id")
            .withGraphFetched("module(selectIdName)")
            .modifiers({
              selectIdName: (mb: QueryBuilder<service.Modules>) => mb.select("id", "name"),
            });
        },
      })
      .first();

    if (!relation) {
      throw new NotFoundError(
        `Relation not found for Token ID ${access_token_id} and Scope ID ${api_scope_id}`
      );
    }
    return relation;
  }

  async create(data: CreateTokenScopeInput, trx?: Transaction): Promise<service.TokenScopes> {
    const tokenExists = await service.AccessTokens.query(trx)
      .findById(data.access_token_id)
      .whereNull("deleted_at");

    if (!tokenExists) {
      throw new BadRequestError(
        `Access Token with ID ${data.access_token_id} not found or inactive.`
      );
    }

    const scopeExists = await service.ApiScopes.query(trx).findById(data.api_scope_id);
    if (!scopeExists) {
      throw new BadRequestError(`API Scope with ID ${data.api_scope_id} does not exist.`);
    }

    const existingRelation = await service.TokenScopes.query(trx).findOne({
      access_token_id: data.access_token_id,
      api_scope_id: data.api_scope_id,
    });
    if (existingRelation) {
      throw new BadRequestError(
        `Scope ID ${data.api_scope_id} is already assigned to Token ID ${data.access_token_id}.`
      );
    }

    const newRelation = await service.TokenScopes.query(trx).insert(data).returning("*");
    return Array.isArray(newRelation) ? newRelation[0] : newRelation;
  }

  async remove(
    access_token_id: string,
    api_scope_id: number,
    trx?: Transaction
  ): Promise<{ message: string }> {
    const numDeleted = await service.TokenScopes.query(trx)
      .delete()
      .where({ access_token_id, api_scope_id });

    if (numDeleted === 0) {
      throw new NotFoundError(
        `Relation not found for Token ID ${access_token_id} and Scope ID ${api_scope_id}`
      );
    }
    return {
      message: `Scope ID ${api_scope_id} removed from Token ID ${access_token_id} successfully`,
    };
  }
}

export default new TokenScopesService();
