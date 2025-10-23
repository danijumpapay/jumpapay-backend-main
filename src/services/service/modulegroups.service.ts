import { service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateGroupInput = Pick<service.ModuleGroups, "name"> &
  Partial<Pick<service.ModuleGroups, "description">>;
type UpdateGroupInput = Partial<CreateGroupInput>;
type GroupRelationParams = { withModules?: boolean };

interface FindAllGroupsOptions {
  limit: number;
  offset: number;
  search?: string;
  sort?: string;
  withModules?: boolean;
}

export class ModuleGroupsService {
  async findAll({
    limit,
    offset,
    search,
    sort,
    withModules,
  }: FindAllGroupsOptions): Promise<Page<service.ModuleGroups>> {
    let query = service.ModuleGroups.query();

    if (search) {
      query = query.where("name", "ilike", `%${search}%`);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "name"];
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
    if (withModules) {
      eagerGraph.modules = { $modify: ["selectIdNameActive"] };
    }

    const modifiers = {
      selectIdNameActive: (builder: QueryBuilder<service.Modules>) => {
        builder.select("id", "name", "is_active").where("is_active", true);
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const groupsPage: Page<service.ModuleGroups> = await query.page(page, limit);
    return groupsPage;
  }

  async findOne(
    id: number,
    { withModules }: GroupRelationParams = {}
  ): Promise<service.ModuleGroups> {
    let query = service.ModuleGroups.query().findById(id);

    const eagerGraph: Record<string, any> = {};
    if (withModules) {
      eagerGraph.modules = { $modify: ["selectIdNameActive"] };
    }

    const modifiers = {
      selectIdNameActive: (builder: QueryBuilder<service.Modules>) => {
        builder.select("id", "name", "is_active").where("is_active", true);
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const group = await query;
    if (!group) {
      throw new NotFoundError(`Module Group with ID ${id} not found`);
    }
    return group;
  }

  async create(data: CreateGroupInput, trx?: Transaction): Promise<service.ModuleGroups> {
    const existing = await service.ModuleGroups.query(trx).findOne({ name: data.name });
    if (existing) {
      throw new BadRequestError(`Module Group with name "${data.name}" already exists.`);
    }

    const newGroup = await service.ModuleGroups.query(trx).insert(data).returning("*");
    return Array.isArray(newGroup) ? newGroup[0] : newGroup;
  }

  async update(
    id: number,
    data: UpdateGroupInput,
    trx?: Transaction
  ): Promise<service.ModuleGroups> {
    const group = await service.ModuleGroups.query(trx).findById(id);
    if (!group) {
      throw new NotFoundError(`Module Group with ID ${id} not found`);
    }

    if (data.name && data.name !== group.name) {
      const existing = await service.ModuleGroups.query(trx)
        .findOne({ name: data.name })
        .whereNot("id", id);
      if (existing) {
        throw new BadRequestError(`Module Group with name "${data.name}" already exists.`);
      }
    }

    const updatedGroups = await group.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedGroups) ? updatedGroups[0] : updatedGroups;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await service.ModuleGroups.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`Module Group with ID ${id} not found`);
    }
    return { message: `Module Group with ID ${id} deleted successfully` };
  }
}

export default new ModuleGroupsService();
