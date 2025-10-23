import { common, service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateFeeServiceInput = Omit<common.JumpapayFeeServices, "id">;
type UpdateFeeServiceInput = Partial<Omit<common.JumpapayFeeServices, "id">>;

interface FindAllFeeServicesOptions {
  limit: number;
  offset: number;
  jumpapay_fee_id?: number;
  service_id?: number;
  order_fee_name?: number;
  order_fee_group?: number;
  type?: "FLAT" | "FORMULA";
  is_active?: boolean;
  sort?: string;
}

export class JumpapayFeeServicesService {
  async findAll({
    limit,
    offset,
    jumpapay_fee_id,
    service_id,
    order_fee_name,
    order_fee_group,
    type,
    is_active,
    sort,
  }: FindAllFeeServicesOptions): Promise<Page<common.JumpapayFeeServices>> {
    let query = common.JumpapayFeeServices.query();

    if (jumpapay_fee_id) query = query.where("jumpapay_fee_id", jumpapay_fee_id);
    if (service_id) query = query.where("service_id", service_id);
    if (order_fee_name) query = query.where("order_fee_name", order_fee_name);
    if (order_fee_group) query = query.where("order_fee_group", order_fee_group);
    if (type) query = query.where("type", type);
    if (typeof is_active === "boolean") query = query.where("is_active", is_active);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = [
        "id",
        "jumpapay_fee_id",
        "service_id",
        "order_fee_name",
        "order_fee_group",
        "type",
        "is_active",
      ];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("id", "ASC");
    }

    query = query.withGraphFetched("[fee(selectIdNameCode), service(selectIdNameService)]");

    const modifiers = {
      selectIdNameCode: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder.select("id", "name", "code").whereNull("deleted_at");
      },
      selectIdNameService: (builder: QueryBuilder<service.Services>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
    };
    query = query.modifiers(modifiers);

    const page = Math.floor(offset / limit);
    const feeServicesPage: Page<common.JumpapayFeeServices> = await query.page(page, limit);
    return feeServicesPage;
  }

  async findOne(id: number): Promise<common.JumpapayFeeServices> {
    const feeService = await common.JumpapayFeeServices.query()
      .findById(id)
      .withGraphFetched("[fee(selectIdNameCode), service(selectIdNameService)]")
      .modifiers({
        selectIdNameCode: (builder: QueryBuilder<common.JumpapayFees>) => {
          builder.select("id", "name", "code").whereNull("deleted_at");
        },
        selectIdNameService: (builder: QueryBuilder<service.Services>) => {
          builder.select("id", "name").whereNull("deleted_at");
        },
      });

    if (!feeService) {
      throw new NotFoundError(`Jumpapay Fee Service relation with ID ${id} not found`);
    }
    return feeService;
  }

  async create(
    data: CreateFeeServiceInput,
    trx?: Transaction
  ): Promise<common.JumpapayFeeServices> {
    const feeExists = await common.JumpapayFees.query(trx)
      .findById(data.jumpapay_fee_id)
      .whereNull("deleted_at");
    if (!feeExists)
      throw new BadRequestError(`Jumpapay Fee with ID ${data.jumpapay_fee_id} not found.`);
    const serviceExists = await service.Services.query(trx)
      .findById(data.service_id)
      .whereNull("deleted_at");
    if (!serviceExists) throw new BadRequestError(`Service with ID ${data.service_id} not found.`);

    if (data.type === "FLAT" && (data.value === null || data.value === undefined)) {
      throw new BadRequestError('Value is required when type is "FLAT"');
    }
    if (data.type === "FORMULA" && !data.formula) {
      throw new BadRequestError('Formula is required when type is "FORMULA"');
    }
    if (data.type === "FLAT") data.formula = null;
    if (data.type === "FORMULA") data.value = null;

    const newRelation = await common.JumpapayFeeServices.query(trx).insert(data).returning("*");
    return Array.isArray(newRelation) ? newRelation[0] : newRelation;
  }

  async update(
    id: number,
    data: UpdateFeeServiceInput,
    trx?: Transaction
  ): Promise<common.JumpapayFeeServices> {
    const relation = await common.JumpapayFeeServices.query(trx).findById(id);
    if (!relation) {
      throw new NotFoundError(`Jumpapay Fee Service relation with ID ${id} not found`);
    }

    /*
    // NOT DONE YET
    if (data.jumpapay_fee_id && data.jumpapay_fee_id !== relation.jumpapay_fee_id) {
    }
    if (data.service_id && data.service_id !== relation.service_id) {
    }
    */

    const finalType = data.type ?? relation.type;
    const finalValue = data.value !== undefined ? data.value : relation.value;
    const finalFormula = data.formula !== undefined ? data.formula : relation.formula;

    if (finalType === "FLAT" && (finalValue === null || finalValue === undefined)) {
      throw new BadRequestError('Value cannot be null when type is "FLAT"');
    }
    if (finalType === "FORMULA" && !finalFormula) {
      throw new BadRequestError('Formula cannot be empty or null when type is "FORMULA"');
    }
    if (data.type && data.type !== relation.type) {
      if (data.type === "FLAT") data.formula = null;
      if (data.type === "FORMULA") data.value = null;
    }

    const updatedRelations = await relation.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedRelations) ? updatedRelations[0] : updatedRelations;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await common.JumpapayFeeServices.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`Jumpapay Fee Service relation with ID ${id} not found`);
    }
    return { message: `Jumpapay Fee Service relation with ID ${id} deleted successfully` };
  }
}

export default new JumpapayFeeServicesService();
