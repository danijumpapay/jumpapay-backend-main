import { transaction, company } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreatePaymentItemInput = Pick<transaction.PaymentItems, "payment_id" | "order_id">;

type PaymentItemRelationParams = {
  withPayment?: boolean;
  withOrder?: boolean;
};

interface FindAllPaymentItemsOptions extends PaymentItemRelationParams {
  limit: number;
  offset: number;
  payment_id?: string;
  order_id?: string;
  sort?: string;
}

export class PaymentItemsService {
  private T_ITEMS = transaction.PaymentItems.tableName;
  private T_PAYMENTS = transaction.Payments.tableName;
  private T_ORDERS = transaction.Orders.tableName;
  private T_COMPANIES = company.Companies.tableName;

  async findAll({
    limit,
    offset,
    payment_id,
    order_id,
    sort,
    withPayment,
    withOrder,
  }: FindAllPaymentItemsOptions): Promise<Page<transaction.PaymentItems>> {
    let query = transaction.PaymentItems.query();

    if (payment_id) query = query.where(`${this.T_ITEMS}.payment_id`, payment_id);
    if (order_id) query = query.where(`${this.T_ITEMS}.order_id`, order_id);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["payment_id", "order_id"];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${this.T_ITEMS}.${column}`
        : `${this.T_ITEMS}.payment_id`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query
        .orderBy(`${this.T_ITEMS}.payment_id`, "ASC")
        .orderBy(`${this.T_ITEMS}.order_id`, "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withPayment) eagerGraph.payment = { $modify: ["selectPaymentInfo"] };
    if (withOrder) eagerGraph.order = { $modify: ["selectOrderInfo"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const itemsPage: Page<transaction.PaymentItems> = await query.page(page, limit);
    return itemsPage;
  }

  async findOne(
    payment_id: string,
    order_id: string,
    { withPayment, withOrder }: PaymentItemRelationParams = {}
  ): Promise<transaction.PaymentItems> {
    let query = transaction.PaymentItems.query()
      .where({
        payment_id: payment_id,
        order_id: order_id,
      })
      .first();

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withPayment) eagerGraph.payment = { $modify: ["selectPaymentInfo"] };
    if (withOrder) eagerGraph.order = { $modify: ["selectOrderInfo"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const item = await query;
    if (!item) {
      throw new NotFoundError(
        `Payment Item relation not found for Payment ID ${payment_id} and Order ID ${order_id}`
      );
    }
    return item;
  }

  async create(data: CreatePaymentItemInput, trx?: Transaction): Promise<transaction.PaymentItems> {
    const paymentExists = await transaction.Payments.query(trx)
      .findById(data.payment_id)
      .whereNull("deleted_at");
    if (!paymentExists) throw new BadRequestError(`Payment with ID ${data.payment_id} not found.`);

    const orderExists = await transaction.Orders.query(trx)
      .findById(data.order_id)
      .whereNull("deleted_at");
    if (!orderExists) throw new BadRequestError(`Order with ID ${data.order_id} not found.`);

    const existingItem = await transaction.PaymentItems.query(trx).findOne({
      payment_id: data.payment_id,
      order_id: data.order_id,
    });
    if (existingItem) {
      throw new BadRequestError("This order is already linked to this payment.");
    }

    const newItem = await transaction.PaymentItems.query(trx).insert(data).returning("*");
    return Array.isArray(newItem) ? newItem[0] : newItem;
  }

  async remove(
    payment_id: string,
    order_id: string,
    trx?: Transaction
  ): Promise<{ message: string }> {
    const numDeleted = await transaction.PaymentItems.query(trx).delete().where({
      payment_id: payment_id,
      order_id: order_id,
    });

    if (numDeleted === 0) {
      throw new NotFoundError(
        `Payment Item relation not found for Payment ID ${payment_id} and Order ID ${order_id}`
      );
    }
    return {
      message: `Payment Item relation (Order ${order_id} <> Payment ${payment_id}) deleted successfully`,
    };
  }

  private getEagerModifiers() {
    return {
      selectPaymentInfo: (builder: QueryBuilder<transaction.Payments>) => {
        builder
          .select(
            `${this.T_PAYMENTS}.id`,
            `${this.T_PAYMENTS}.invoice_number`,
            `${this.T_PAYMENTS}.amount`,
            `${this.T_PAYMENTS}.status`
          )
          .whereNull(`${this.T_PAYMENTS}.deleted_at`);
      },
      selectOrderInfo: (builder: QueryBuilder<transaction.Orders>) => {
        builder
          .select(
            `${this.T_ORDERS}.id`,
            `${this.T_ORDERS}.booking_id`,
            `${this.T_ORDERS}.price`,
            `${this.T_ORDERS}.created_at`
          )
          .whereNull(`${this.T_ORDERS}.deleted_at`);
      },
    };
  }
}

export default new PaymentItemsService();
