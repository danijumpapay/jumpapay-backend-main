import { transaction, company, user } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";
import { v4 as uuidv4 } from "uuid";

type PaymentStatusValue = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";

type CreatePaymentInput = Pick<transaction.Payments, "invoice_number" | "amount"> &
  Partial<
    Pick<
      transaction.Payments,
      | "company_id"
      | "payment_gateway_ref"
      | "payment_method_name"
      | "payment_method_type"
      | "status"
      | "paid_at"
      | "expired_at"
      | "payment_details"
    >
  > & {
    order_ids: string[];
  };
type UpdatePaymentInput = Partial<
  Pick<
    transaction.Payments,
    "payment_gateway_ref" | "status" | "paid_at" | "expired_at" | "payment_details"
  >
>;
type PaymentRelationParams = {
  withCompany?: boolean;
  withItems?: boolean;
  withItemsOrder?: boolean;
};

interface FindAllPaymentsOptions extends PaymentRelationParams {
  limit: number;
  offset: number;
  company_id?: string;
  invoice_number?: string;
  payment_gateway_ref?: string;
  status?: PaymentStatusValue;
  payment_method_type?: string;
  paid_at_start?: string;
  paid_at_end?: string;
  created_at_start?: string;
  created_at_end?: string;
  sort?: string;
}

export class PaymentsService {
  private T_PAYMENTS = transaction.Payments.tableName;
  private T_COMPANIES = company.Companies.tableName;
  private T_ITEMS = transaction.PaymentItems.tableName;
  private T_ORDERS = transaction.Orders.tableName;

  async findAll({
    limit,
    offset,
    company_id,
    invoice_number,
    payment_gateway_ref,
    status,
    payment_method_type,
    paid_at_start,
    paid_at_end,
    created_at_start,
    created_at_end,
    sort,
    withCompany,
    withItems,
    withItemsOrder,
  }: FindAllPaymentsOptions): Promise<Page<transaction.Payments>> {
    let query = transaction.Payments.query().whereNull(`${this.T_PAYMENTS}.deleted_at`);

    if (company_id) query = query.where(`${this.T_PAYMENTS}.company_id`, company_id);
    if (invoice_number)
      query = query.where(`${this.T_PAYMENTS}.invoice_number`, "ilike", `%${invoice_number}%`);
    if (payment_gateway_ref)
      query = query.where(`${this.T_PAYMENTS}.payment_gateway_ref`, payment_gateway_ref);
    if (status) query = query.where(`${this.T_PAYMENTS}.status`, status);
    if (payment_method_type)
      query = query.where(
        `${this.T_PAYMENTS}.payment_method_type`,
        "ilike",
        `%${payment_method_type}%`
      );
    if (paid_at_start) query = query.where(`${this.T_PAYMENTS}.paid_at`, ">=", paid_at_start);
    if (paid_at_end) query = query.where(`${this.T_PAYMENTS}.paid_at`, "<=", paid_at_end);
    if (created_at_start)
      query = query.where(`${this.T_PAYMENTS}.created_at`, ">=", created_at_start);
    if (created_at_end) query = query.where(`${this.T_PAYMENTS}.created_at`, "<=", created_at_end);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = [
        "id",
        "invoice_number",
        "amount",
        "status",
        "paid_at",
        "expired_at",
        "created_at",
      ];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${this.T_PAYMENTS}.${column}`
        : `${this.T_PAYMENTS}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${this.T_PAYMENTS}.created_at`, "DESC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withCompany) eagerGraph.company = { $modify: ["selectBasicCompanyInfo"] };
    if (withItems || withItemsOrder) {
      eagerGraph.items = {
        $modify: ["selectItemInfo"],
        ...(withItemsOrder && {
          order: { $modify: ["selectBasicOrderInfo"] },
        }),
      };
    }

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const paymentsPage: Page<transaction.Payments> = await query.page(page, limit);
    return paymentsPage;
  }

  async findOne(
    id: string,
    { withCompany, withItems, withItemsOrder }: PaymentRelationParams = {}
  ): Promise<transaction.Payments> {
    let query = transaction.Payments.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withCompany) eagerGraph.company = { $modify: ["selectBasicCompanyInfo"] };
    if (withItems || withItemsOrder) {
      eagerGraph.items = {
        $modify: ["selectItemInfo"],
        ...(withItemsOrder && {
          order: { $modify: ["selectBasicOrderInfo"] },
        }),
      };
    }

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const payment = await query;
    if (!payment) {
      throw new NotFoundError(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async create(data: CreatePaymentInput, trx?: Transaction): Promise<transaction.Payments> {
    const { order_ids, ...paymentData } = data;

    if (paymentData.company_id) {
      const companyExists = await company.Companies.query(trx)
        .findById(paymentData.company_id)
        .whereNull("deleted_at");
      if (!companyExists)
        throw new BadRequestError(`Company with ID ${paymentData.company_id} not found.`);
    }

    const orders = await transaction.Orders.query(trx).findByIds(order_ids).whereNull("deleted_at");
    if (orders.length !== order_ids.length) {
      throw new BadRequestError("One or more Order IDs are invalid or not found.");
    }

    const invoiceExists = await transaction.Payments.query(trx)
      .findOne({ invoice_number: paymentData.invoice_number })
      .whereNull("deleted_at");
    if (invoiceExists) {
      throw new BadRequestError(`Invoice number ${paymentData.invoice_number} already exists.`);
    }

    const finalPaymentData = {
      id: uuidv4(),
      status: "PENDING" as const,
      ...paymentData,
    };

    const newPayment = await transaction.Payments.query(trx)
      .insert(finalPaymentData)
      .returning("*");
    const paymentInstance = Array.isArray(newPayment) ? newPayment[0] : newPayment;

    if (paymentInstance && orders.length > 0) {
      const itemsData = orders.map((order) => ({
        payment_id: paymentInstance.id,
        order_id: order.id,
      }));
      await transaction.PaymentItems.query(trx).insert(itemsData);
    }

    return paymentInstance;
  }

  async update(
    id: string,
    data: UpdatePaymentInput,
    trx?: Transaction
  ): Promise<transaction.Payments> {
    const payment = await transaction.Payments.query(trx).findById(id).whereNull("deleted_at");
    if (!payment) {
      throw new NotFoundError(`Payment with ID ${id} not found`);
    }

    const updatedPayments = await payment.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedPayments) ? updatedPayments[0] : updatedPayments;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const payment = await transaction.Payments.query(trx).findById(id).whereNull("deleted_at");
    if (!payment) {
      throw new NotFoundError(`Payment with ID ${id} not found`);
    }

    if (payment.status === "PAID") {
      throw new BadRequestError("Cannot delete a completed payment.");
    }

    await transaction.PaymentItems.query(trx).delete().where("payment_id", id);

    return { message: `Payment with ID ${id} deleted successfully` };
  }

  private getEagerModifiers() {
    return {
      selectBasicCompanyInfo: (builder: QueryBuilder<company.Companies>) => {
        builder
          .select(
            `${this.T_COMPANIES}.id`,
            `${this.T_COMPANIES}.name`,
            `${this.T_COMPANIES}.company_code`
          )
          .whereNull(`${this.T_COMPANIES}.deleted_at`);
      },
      selectItemInfo: (builder: QueryBuilder<transaction.PaymentItems>) => {
        builder.select(`${this.T_ITEMS}.order_id`);
      },
      selectBasicOrderInfo: (builder: QueryBuilder<transaction.Orders>) => {
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

export default new PaymentsService();
