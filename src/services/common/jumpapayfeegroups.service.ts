import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError } from "../../utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateGroupInput = Pick<common.JumpapayFeeGroups, "name"> &
  Partial<Pick<common.JumpapayFeeGroups, "description" | "order" | "is_active">>;
type UpdateGroupInput = Partial<CreateGroupInput>;
type GroupRelationParams = { withFees?: boolean };

interface FindAllGroupsOptions {
  limit: number;
  offset: number;
  search?: string;
  is_active?: boolean;
  sort?: string;
  withFees?: boolean;
}

export class JumpapayFeeGroupsService {
  async findAll({
    limit,
    offset,
    search,
    is_active,
    sort,
    withFees,
  }: FindAllGroupsOptions): Promise<Page<common.JumpapayFeeGroups>> {
    let query = common.JumpapayFeeGroups.query().whereNull("deleted_at");

    if (search) {
      query = query.where("name", "ilike", `%${search}%`);
    }
    if (typeof is_active === "boolean") {
      query = query.where("is_active", is_active);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "name", "order", "is_active", "created_at"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("order", "ASC").orderBy("name", "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    if (withFees) {
      eagerGraph.fees = { $modify: ["activeOnly", "ordered"] };
    }

    const modifiers = {
      activeOnly: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder
          .select("id", "name", "code", "order", "is_active")
          .whereNull("deleted_at")
          .where("is_active", true);
      },
      ordered: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder.orderBy("order", "ASC").orderBy("name", "ASC");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const groupsPage: Page<common.JumpapayFeeGroups> = await query.page(page, limit);
    return groupsPage;
  }

  async findOne(
    id: number,
    { withFees }: GroupRelationParams = {}
  ): Promise<common.JumpapayFeeGroups> {
    let query = common.JumpapayFeeGroups.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    if (withFees) {
      eagerGraph.fees = { $modify: ["activeOnly", "ordered"] };
    }

    const modifiers = {
      activeOnly: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder
          .select("id", "name", "code", "order", "is_active")
          .whereNull("deleted_at")
          .where("is_active", true);
      },
      ordered: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder.orderBy("order", "ASC").orderBy("name", "ASC");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const group = await query;
    if (!group) {
      throw new NotFoundError(`Jumpapay Fee Group with ID ${id} not found`);
    }
    return group;
  }

  async create(data: CreateGroupInput, trx?: Transaction): Promise<common.JumpapayFeeGroups> {
    const newGroup = await common.JumpapayFeeGroups.query(trx).insert(data).returning("*");
    return Array.isArray(newGroup) ? newGroup[0] : newGroup;
  }

  async update(
    id: number,
    data: UpdateGroupInput,
    trx?: Transaction
  ): Promise<common.JumpapayFeeGroups> {
    const group = await common.JumpapayFeeGroups.query(trx).findById(id).whereNull("deleted_at");
    if (!group) {
      throw new NotFoundError(`Jumpapay Fee Group with ID ${id} not found`);
    }
    const updatedGroups = await group.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedGroups) ? updatedGroups[0] : updatedGroups;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const group = await common.JumpapayFeeGroups.query(trx).findById(id).whereNull("deleted_at");
    if (!group) {
      throw new NotFoundError(`Jumpapay Fee Group with ID ${id} not found`);
    }
    await group.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Jumpapay Fee Group with ID ${id} deleted successfully` };
  }
}

export default new JumpapayFeeGroupsService();
