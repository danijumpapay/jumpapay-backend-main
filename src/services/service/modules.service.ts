import { service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateModuleInput = Pick<service.Modules, "module_group_id" | "name"> &
  Partial<Pick<service.Modules, "description" | "is_active">>;
type UpdateModuleInput = Partial<CreateModuleInput>;
type ModuleRelationParams = { withGroup?: boolean; withApiScopes?: boolean };

interface FindAllModulesOptions {
  limit: number;
  offset: number;
  search?: string;
  module_group_id?: number;
  is_active?: boolean;
  sort?: string;
  withGroup?: boolean;
  withApiScopes?: boolean;
}

export class ModulesService {
  async findAll({
    limit,
    offset,
    search,
    module_group_id,
    is_active,
    sort,
    withGroup,
    withApiScopes,
  }: FindAllModulesOptions): Promise<Page<service.Modules>> {
    let query = service.Modules.query();

    if (search) {
      query = query.where("name", "ilike", `%${search}%`);
    }
    if (module_group_id) {
      query = query.where("module_group_id", module_group_id);
    }
    if (typeof is_active === "boolean") {
      query = query.where("is_active", is_active);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "name", "module_group_id", "is_active"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("name", "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    if (withGroup) {
      eagerGraph.group = { $modify: ["selectIdName"] };
    }
    if (withApiScopes) {
      eagerGraph.apiScopes = { $modify: ["selectIdAccess"] };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<service.ModuleGroups>) => {
        builder.select("id", "name");
      },
      selectIdAccess: (builder: QueryBuilder<service.ApiScopes>) => {
        builder.select("id", "access", "description");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const modulesPage: Page<service.Modules> = await query.page(page, limit);
    return modulesPage;
  }

  async findOne(
    id: number,
    { withGroup, withApiScopes }: ModuleRelationParams = {}
  ): Promise<service.Modules> {
    let query = service.Modules.query().findById(id);

    const eagerGraph: Record<string, any> = {};
    if (withGroup) {
      eagerGraph.group = { $modify: ["selectIdName"] };
    }
    if (withApiScopes) {
      eagerGraph.apiScopes = { $modify: ["selectIdAccess"] };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<service.ModuleGroups>) => {
        builder.select("id", "name");
      },
      selectIdAccess: (builder: QueryBuilder<service.ApiScopes>) => {
        builder.select("id", "access", "description");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const module = await query;
    if (!module) {
      throw new NotFoundError(`Module with ID ${id} not found`);
    }
    return module;
  }

  async create(data: CreateModuleInput, trx?: Transaction): Promise<service.Modules> {
    const groupExists = await service.ModuleGroups.query(trx).findById(data.module_group_id);
    if (!groupExists) {
      throw new BadRequestError(`Module Group with ID ${data.module_group_id} does not exist.`);
    }

    const existing = await service.Modules.query(trx).findOne({ name: data.name });
    if (existing) {
      throw new BadRequestError(`Module with name "${data.name}" already exists.`);
    }

    const newModule = await service.Modules.query(trx).insert(data).returning("*");
    return Array.isArray(newModule) ? newModule[0] : newModule;
  }

  async update(id: number, data: UpdateModuleInput, trx?: Transaction): Promise<service.Modules> {
    const module = await service.Modules.query(trx).findById(id);
    if (!module) {
      throw new NotFoundError(`Module with ID ${id} not found`);
    }

    if (data.module_group_id && data.module_group_id !== module.module_group_id) {
      const groupExists = await service.ModuleGroups.query(trx).findById(data.module_group_id);
      if (!groupExists) {
        throw new BadRequestError(`Module Group with ID ${data.module_group_id} does not exist.`);
      }
    }

    if (data.name && data.name !== module.name) {
      const existing = await service.Modules.query(trx)
        .findOne({ name: data.name })
        .whereNot("id", id);
      if (existing) {
        throw new BadRequestError(`Module with name "${data.name}" already exists.`);
      }
    }

    const updatedModules = await module.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedModules) ? updatedModules[0] : updatedModules;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await service.Modules.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`Module with ID ${id} not found`);
    }
    return { message: `Module with ID ${id} deleted successfully` };
  }
}

export default new ModulesService();
