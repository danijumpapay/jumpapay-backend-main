import { transaction, common, service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateOrderDetailFeeInput = Omit<transaction.OrderDetailFees, "id" | "created_at">;
type UpdateOrderDetailFeeInput = Partial<
  Pick<
    transaction.OrderDetailFees,
    "order_fee_name" | "order_fee_group" | "fee_name" | "fee_group_name" | "value"
  >
>;
type OrderDetailFeeRelationParams = {
  withDetail?: boolean;
  withJumpapayFee?: boolean;
};

interface FindAllOrderDetailFeesOptions extends OrderDetailFeeRelationParams {
  limit: number;
  offset: number;
  order_detail_id?: string;
  jumpapay_fee_id?: number;
  order_fee_name?: number;
  order_fee_group?: number;
  sort?: string;
}

export class OrderDetailFeesService {
  private T_FEES = transaction.OrderDetailFees.tableName;
  private T_DETAILS = transaction.OrderDetails.tableName;
  private T_JFEES = common.JumpapayFees.tableName;
  private T_JGROUPS = common.JumpapayFeeGroups.tableName;
  private T_SERVICES = service.Services.tableName;

  async findAll({
    limit,
    offset,
    order_detail_id,
    jumpapay_fee_id,
    order_fee_name,
    order_fee_group,
    sort,
    withDetail,
    withJumpapayFee,
  }: FindAllOrderDetailFeesOptions): Promise<Page<transaction.OrderDetailFees>> {
    let query = transaction.OrderDetailFees.query();

    if (order_detail_id) query = query.where(`${this.T_FEES}.order_detail_id`, order_detail_id);
    if (jumpapay_fee_id) query = query.where(`${this.T_FEES}.jumpapay_fee_id`, jumpapay_fee_id);
    if (order_fee_name) query = query.where(`${this.T_FEES}.order_fee_name`, order_fee_name);
    if (order_fee_group) query = query.where(`${this.T_FEES}.order_fee_group`, order_fee_group);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = [
        "id",
        "order_detail_id",
        "jumpapay_fee_id",
        "fee_name",
        "value",
        "created_at",
      ];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${this.T_FEES}.${column}`
        : `${this.T_FEES}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${this.T_FEES}.created_at`, "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withDetail) eagerGraph.detail = { $modify: ["selectDetailInfo"] };
    if (withJumpapayFee) eagerGraph.jumpapayFee = { $modify: ["selectFeeCodeNameGroup"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const feesPage: Page<transaction.OrderDetailFees> = await query.page(page, limit);
    return feesPage;
  }

  async findOne(
    id: string,
    { withDetail, withJumpapayFee }: OrderDetailFeeRelationParams = {}
  ): Promise<transaction.OrderDetailFees> {
    let query = transaction.OrderDetailFees.query().findById(id);

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withDetail) eagerGraph.detail = { $modify: ["selectDetailInfo"] };
    if (withJumpapayFee) eagerGraph.jumpapayFee = { $modify: ["selectFeeCodeNameGroup"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const orderDetailFee = await query;
    if (!orderDetailFee) {
      throw new NotFoundError(`Order Detail Fee with ID ${id} not found`);
    }
    return orderDetailFee;
  }

  async create(
    data: CreateOrderDetailFeeInput,
    trx?: Transaction
  ): Promise<transaction.OrderDetailFees> {
    const detailExists = await transaction.OrderDetails.query(trx).findById(data.order_detail_id);
    if (!detailExists)
      throw new BadRequestError(`Order Detail with ID ${data.order_detail_id} not found.`);

    const feeData = {
      ...data,
    };

    const newFee = await transaction.OrderDetailFees.query(trx).insert(feeData).returning("*");
    return Array.isArray(newFee) ? newFee[0] : newFee;
  }

  async update(
    id: string,
    data: UpdateOrderDetailFeeInput,
    trx?: Transaction
  ): Promise<transaction.OrderDetailFees> {
    const orderDetailFee = await transaction.OrderDetailFees.query(trx).findById(id);
    if (!orderDetailFee) {
      throw new NotFoundError(`Order Detail Fee with ID ${id} not found`);
    }

    const updatedFees = await orderDetailFee.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedFees) ? updatedFees[0] : updatedFees;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await transaction.OrderDetailFees.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`Order Detail Fee with ID ${id} not found`);
    }
    return { message: `Order Detail Fee with ID ${id} deleted successfully` };
  }

  private getEagerModifiers() {
    return {
      selectDetailInfo: (builder: QueryBuilder<transaction.OrderDetails>) => {
        builder
          .select(`${this.T_DETAILS}.id`, `${this.T_DETAILS}.name`, `${this.T_DETAILS}.service_id`)
          .withGraphFetched("service(selectServiceName)")
          .modifiers({
            selectServiceName: (svcBuilder: QueryBuilder<service.Services>) => {
              svcBuilder
                .select(`${this.T_SERVICES}.id`, `${this.T_SERVICES}.name`)
                .whereNull(`${this.T_SERVICES}.deleted_at`);
            },
          });
      },
      selectFeeCodeNameGroup: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder
          .select(
            `${this.T_JFEES}.id`,
            `${this.T_JFEES}.code`,
            `${this.T_JFEES}.name`,
            `${this.T_JFEES}.jumpapay_fee_group_id`
          )
          .withGraphFetched("group(selectGroupName)")
          .whereNull(`${this.T_JFEES}.deleted_at`);
      },
      selectGroupName: (groupBuilder: QueryBuilder<common.JumpapayFeeGroups>) => {
        groupBuilder
          .select(`${this.T_JGROUPS}.id`, `${this.T_JGROUPS}.name`)
          .whereNull(`${this.T_JGROUPS}.deleted_at`);
      },
    };
  }
}

export default new OrderDetailFeesService();
