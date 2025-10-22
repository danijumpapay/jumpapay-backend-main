import { service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type ApiScopeAccessValue = "READ" | "WRITE" | "DELETE" | "UPDATE" | "MANAGE" | "*";

type CreateApiScopeInput = Pick<service.ApiScopes, "module_id" | "access"> &
  Partial<Pick<service.ApiScopes, "description">>;
type UpdateApiScopeInput = Partial<CreateApiScopeInput>;
type ApiScopeRelationParams = { withModule?: boolean };

interface FindAllApiScopesOptions {
  limit: number;
  offset: number;
  module_id?: number;
  access?: ApiScopeAccessValue;
  sort?: string;
  withModule?: boolean;
}

export class ApiScopesService {
  async findAll({
    limit,
    offset,
    module_id,
    access,
    sort,
    withModule,
  }: FindAllApiScopesOptions): Promise<Page<service.ApiScopes>> {
    let query = service.ApiScopes.query();

    if (module_id) {
      query = query.where("module_id", module_id);
    }
    if (access) {
      query = query.where("access", access);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "module_id", "access"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("id", "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    if (withModule) {
      eagerGraph.module = { $modify: ["selectIdName"] };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<service.Modules>) => {
        builder.select("id", "name").where("is_active", true);
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const apiScopesPage: Page<service.ApiScopes> = await query.page(page, limit);
    return apiScopesPage;
  }

  async findOne(
    id: number,
    { withModule }: ApiScopeRelationParams = {}
  ): Promise<service.ApiScopes> {
    let query = service.ApiScopes.query().findById(id);

    const eagerGraph: Record<string, any> = {};
    if (withModule) {
      eagerGraph.module = { $modify: ["selectIdName"] };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<service.Modules>) => {
        builder.select("id", "name").where("is_active", true);
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const apiScope = await query;
    if (!apiScope) {
      throw new NotFoundError(`API Scope with ID ${id} not found`);
    }
    return apiScope;
  }

  async create(data: CreateApiScopeInput, trx?: Transaction): Promise<service.ApiScopes> {
    const moduleExists = await service.Modules.query(trx).findById(data.module_id);
    if (!moduleExists) {
      throw new BadRequestError(`Module with ID ${data.module_id} does not exist.`);
    }

    const existingScope = await service.ApiScopes.query(trx).findOne({
      module_id: data.module_id,
      access: data.access,
    });
    if (existingScope) {
      throw new BadRequestError(
        `API Scope with access "${data.access}" already exists for Module ID ${data.module_id}.`
      );
    }

    const newApiScope = await service.ApiScopes.query(trx).insert(data).returning("*");
    return Array.isArray(newApiScope) ? newApiScope[0] : newApiScope;
  }

  async update(
    id: number,
    data: UpdateApiScopeInput,
    trx?: Transaction
  ): Promise<service.ApiScopes> {
    const apiScope = await service.ApiScopes.query(trx).findById(id);
    if (!apiScope) {
      throw new NotFoundError(`API Scope with ID ${id} not found`);
    }

    if (data.module_id && data.module_id !== apiScope.module_id) {
      const moduleExists = await service.Modules.query(trx).findById(data.module_id);
      if (!moduleExists) {
        throw new BadRequestError(`Module with ID ${data.module_id} does not exist.`);
      }
    }

    const finalModuleId = data.module_id ?? apiScope.module_id;
    const finalAccess = data.access ?? apiScope.access;
    if (
      (data.module_id && data.module_id !== apiScope.module_id) ||
      (data.access && data.access !== apiScope.access)
    ) {
      const existingScope = await service.ApiScopes.query(trx)
        .findOne({
          module_id: finalModuleId,
          access: finalAccess,
        })
        .whereNot("id", id);
      if (existingScope) {
        throw new BadRequestError(
          `API Scope with access "${finalAccess}" already exists for Module ID ${finalModuleId}.`
        );
      }
    }

    const updatedApiScopes = await apiScope.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedApiScopes) ? updatedApiScopes[0] : updatedApiScopes;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await service.ApiScopes.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`API Scope with ID ${id} not found`);
    }
    return { message: `API Scope with ID ${id} deleted successfully` };
  }
}

export default new ApiScopesService();
