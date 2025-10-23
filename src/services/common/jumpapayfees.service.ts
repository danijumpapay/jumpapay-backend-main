import { common, service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type FeeRelationParams = { withGroup?: boolean; withServices?: boolean };

type CreateFeeInput = Omit<
  common.JumpapayFees,
  "id" | "created_at" | "deleted_at" | "type" | "value" | "formula"
>;
type UpdateFeeInput = Partial<
  Omit<common.JumpapayFees, "id" | "created_at" | "deleted_at" | "type" | "value" | "formula">
>;

interface FindAllFeesOptions {
  limit: number;
  offset: number;
  search?: string;
  jumpapay_fee_group_id?: number;
  code?: string;
  is_active?: boolean;
  sort?: string;
  withGroup?: boolean;
  withServices?: boolean;
}

export class JumpapayFeesService {
  async findAll({
    limit,
    offset,
    search,
    jumpapay_fee_group_id,
    code,
    is_active,
    sort,
    withGroup,
    withServices,
  }: FindAllFeesOptions): Promise<Page<common.JumpapayFees>> {
    let query = common.JumpapayFees.query().whereNull("deleted_at");

    if (search) {
      query = query.where((builder) => {
        builder.where("name", "ilike", `%${search}%`).orWhere("code", "ilike", `%${search}%`);
      });
    }
    if (jumpapay_fee_group_id) {
      query = query.where("jumpapay_fee_group_id", jumpapay_fee_group_id);
    }
    if (code) {
      query = query.where("code", "ilike", `%${code}%`);
    }

    if (typeof is_active === "boolean") {
      query = query.where("is_active", is_active);
    }

    if (sort) {
      const [column, direction] = sort.split(":");

      const allowedSortColumns = ["id", "name", "code", "order", "is_active", "created_at"];
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
    if (withGroup) {
      eagerGraph.group = { $modify: ["selectIdName"] };
    }
    if (withServices) {
      eagerGraph.feeServices = {
        $modify: ["selectService"],
        service: { $modify: ["selectIdNameService"] },
      };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<common.JumpapayFeeGroups>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
      selectIdNameService: (builder: QueryBuilder<service.Services>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
      selectService: (builder: QueryBuilder<common.JumpapayFeeServices>) => {
        builder.select("id", "service_id", "type", "value", "formula", "is_active");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const feesPage: Page<common.JumpapayFees> = await query.page(page, limit);
    return feesPage;
  }

  async findOne(
    id: number,
    { withGroup, withServices }: FeeRelationParams = {}
  ): Promise<common.JumpapayFees> {
    let query = common.JumpapayFees.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    if (withGroup) {
      eagerGraph.group = { $modify: ["selectIdName"] };
    }
    if (withServices) {
      eagerGraph.feeServices = {
        $modify: ["selectService"],
        service: { $modify: ["selectIdNameService"] },
      };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<common.JumpapayFeeGroups>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
      selectIdNameService: (builder: QueryBuilder<service.Services>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
      selectService: (builder: QueryBuilder<common.JumpapayFeeServices>) => {
        builder.select("id", "service_id", "type", "value", "formula", "is_active");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const fee = await query;
    if (!fee) {
      throw new NotFoundError(`Jumpapay Fee with ID ${id} not found`);
    }
    return fee;
  }

  async create(data: CreateFeeInput, trx?: Transaction): Promise<common.JumpapayFees> {
    const groupExists = await common.JumpapayFeeGroups.query(trx)
      .findById(data.jumpapay_fee_group_id)
      .whereNull("deleted_at");
    if (!groupExists) {
      throw new BadRequestError(
        `Jumpapay Fee Group with ID ${data.jumpapay_fee_group_id} does not exist.`
      );
    }
    const codeExists = await common.JumpapayFees.query(trx)
      .findOne({ code: data.code })
      .whereNull("deleted_at");
    if (codeExists) {
      throw new BadRequestError(`Jumpapay Fee with code "${data.code}" already exists.`);
    }

    const newFee = await common.JumpapayFees.query(trx).insert(data).returning("*");
    return Array.isArray(newFee) ? newFee[0] : newFee;
  }

  async update(id: number, data: UpdateFeeInput, trx?: Transaction): Promise<common.JumpapayFees> {
    const fee = await common.JumpapayFees.query(trx).findById(id).whereNull("deleted_at");
    if (!fee) {
      throw new NotFoundError(`Jumpapay Fee with ID ${id} not found`);
    }

    if (data.jumpapay_fee_group_id && data.jumpapay_fee_group_id !== fee.jumpapay_fee_group_id) {
      const groupExists = await common.JumpapayFeeGroups.query(trx)
        .findById(data.jumpapay_fee_group_id)
        .whereNull("deleted_at");
      if (!groupExists) {
        throw new BadRequestError(
          `Jumpapay Fee Group with ID ${data.jumpapay_fee_group_id} does not exist.`
        );
      }
    }
    if (data.code && data.code !== fee.code) {
      const codeExists = await common.JumpapayFees.query(trx)
        .findOne({ code: data.code })
        .whereNull("deleted_at")
        .whereNot("id", id);
      if (codeExists) {
        throw new BadRequestError(`Jumpapay Fee with code "${data.code}" already exists.`);
      }
    }

    const updatedFees = await fee.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedFees) ? updatedFees[0] : updatedFees;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const fee = await common.JumpapayFees.query(trx).findById(id).whereNull("deleted_at");
    if (!fee) {
      throw new NotFoundError(`Jumpapay Fee with ID ${id} not found`);
    }
    await fee.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Jumpapay Fee with ID ${id} deleted successfully` };
  }
}

export default new JumpapayFeesService();
