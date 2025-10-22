import { transaction, common, user, company, service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type OrderTypeValue = "INVOICING" | "NON INVOICING";
type OrderPositionValue = "VERIFICATION" | "SHOPPING BAG" | "LIVE ORDER" | "FINAL";

type CreateOrderInput = Pick<transaction.Orders, "order_status_id"> &
  Partial<
    Pick<
      transaction.Orders,
      | "user_id"
      | "company_id"
      | "email"
      | "phone"
      | "city_id"
      | "source"
      | "price"
      | "order_type"
      | "order_position"
      | "payment_type"
    >
  >;
type UpdateOrderInput = Partial<
  Omit<transaction.Orders, "id" | "created_at" | "deleted_at" | "booking_id">
>;
type OrderRelationParams = {
  withUser?: boolean;
  withCompany?: boolean;
  withStatus?: boolean;
  withDetails?: boolean;
  withAddresses?: boolean;
  withNotes?: boolean;
  withPayments?: boolean;
};

interface FindAllOrdersOptions {
  limit: number;
  offset: number;
  user_id?: string;
  company_id?: string;
  order_status_id?: number;
  booking_id?: string;
  phone?: string;
  city_id?: number;
  source?: string;
  status?: string;
  order_type?: OrderTypeValue;
  order_position?: OrderPositionValue;
  payment_type?: string;
  paid_at_start?: string;
  paid_at_end?: string;
  created_at_start?: string;
  created_at_end?: string;
  sort?: string;
  withUser?: boolean;
  withCompany?: boolean;
  withStatus?: boolean;
  withDetails?: boolean;
  withAddresses?: boolean;
  withNotes?: boolean;
  withPayments?: boolean;
}

export class OrdersService {
  async findAll({
    limit,
    offset,
    user_id,
    company_id,
    order_status_id,
    booking_id,
    phone,
    city_id,
    source,
    status,
    order_type,
    order_position,
    payment_type,
    paid_at_start,
    paid_at_end,
    created_at_start,
    created_at_end,
    sort,
    withUser,
    withCompany,
    withStatus,
    withDetails,
    withAddresses,
    withNotes,
    withPayments,
  }: FindAllOrdersOptions): Promise<Page<transaction.Orders>> {
    const T_ORDERS = transaction.Orders.tableName;
    let query = transaction.Orders.query().whereNull(`${T_ORDERS}.deleted_at`);

    if (user_id) query = query.where(`${T_ORDERS}.user_id`, user_id);
    if (company_id) query = query.where(`${T_ORDERS}.company_id`, company_id);
    if (order_status_id) query = query.where(`${T_ORDERS}.order_status_id`, order_status_id);
    if (booking_id) query = query.where(`${T_ORDERS}.booking_id`, "ilike", `%${booking_id}%`);
    if (phone) query = query.where(`${T_ORDERS}.phone`, "ilike", `%${phone}%`);
    if (city_id) query = query.where(`${T_ORDERS}.city_id`, city_id);
    if (source) query = query.where(`${T_ORDERS}.source`, "ilike", `%${source}%`);
    if (status) query = query.where(`${T_ORDERS}.status`, "ilike", `%${status}%`);
    if (order_type) query = query.where(`${T_ORDERS}.order_type`, order_type);
    if (order_position) query = query.where(`${T_ORDERS}.order_position`, order_position);
    if (payment_type) query = query.where(`${T_ORDERS}.payment_type`, "ilike", `%${payment_type}%`);
    if (paid_at_start) query = query.where(`${T_ORDERS}.paid_at`, ">=", paid_at_start);
    if (paid_at_end) query = query.where(`${T_ORDERS}.paid_at`, "<=", paid_at_end);
    if (created_at_start) query = query.where(`${T_ORDERS}.created_at`, ">=", created_at_start);
    if (created_at_end) query = query.where(`${T_ORDERS}.created_at`, "<=", created_at_end);

    if (sort) {
      const [column, direction] = sort.split(":");

      const allowedSortColumns = [
        "id",
        "user_id",
        "company_id",
        "order_status_id",
        "booking_id",
        "created_at",
        "paid_at",
        "price",
        "order_type",
        "order_position",
        "status",
      ];

      const sortColumn = allowedSortColumns.includes(column)
        ? `${T_ORDERS}.${column}`
        : `${T_ORDERS}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${T_ORDERS}.created_at`, "DESC");
    }

    const eagerGraph: Record<string, any> = {};
    if (withUser) eagerGraph.user = { $modify: ["selectBasicUserInfo"] };
    if (withCompany) eagerGraph.company = { $modify: ["selectBasicCompanyInfo"] };
    if (withStatus) eagerGraph.statusRelation = { $modify: ["selectStatusInfo"] };
    if (withDetails) {
      eagerGraph.details = {
        $modify: ["activeDetailsOnly", "orderedDetails"],
        service: { $modify: ["selectServiceName"] },
        fees: {
          $modify: ["selectFeeAmountName"],
          jumpapayFee: {
            $modify: ["selectFeeCodeName"],
          },
        },
        documents: {
          $modify: ["selectDocType"],
        },
      };
    }
    if (withAddresses) eagerGraph.addresses = { $modify: ["activeAddressOnly"] };
    if (withNotes) eagerGraph.notes = { $modify: ["orderedNotes"] };
    if (withPayments) eagerGraph.payments = { $modify: ["selectPaymentInfo"] };

    const modifiers = {
      selectBasicUserInfo: (builder: QueryBuilder<user.Users>) => {
        builder.select("id", "name", "email").whereNull("deleted_at");
      },
      selectBasicCompanyInfo: (builder: QueryBuilder<company.Companies>) => {
        builder.select("id", "name", "company_code").whereNull("deleted_at");
      },
      selectStatusInfo: (builder: QueryBuilder<common.OrderStatus>) => {
        builder.select("id", "name", "alias").whereNull("deleted_at");
      },
      activeDetailsOnly: (builder: QueryBuilder<transaction.OrderDetails>) => {},
      orderedDetails: (builder: QueryBuilder<transaction.OrderDetails>) => {
        builder.orderBy("id", "ASC");
      },
      selectServiceName: (builder: QueryBuilder<service.Services>) => {
        builder.select("id", "name", "slug").whereNull("deleted_at");
      },
      selectFeeAmountName: (builder: QueryBuilder<transaction.OrderDetailFees>) => {
        builder.select("id", "fee_name", "value", "jumpapay_fee_id");
      },
      selectFeeCodeName: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder.select("id", "code", "name").whereNull("deleted_at");
      },
      selectDocType: (builder: QueryBuilder<transaction.OrderDetailDocuments>) => {
        builder.select("id", "type", "document", "created_at", "uploaded_by");
      },
      activeAddressOnly: (builder: QueryBuilder<transaction.OrderAddresses>) => {
        builder.orderBy("delivery_type", "ASC");
      },
      orderedNotes: (builder: QueryBuilder<transaction.OrderNotes>) => {
        builder.select("id", "note", "created_at", "created_by").orderBy("created_at", "DESC");
      },
      selectPaymentInfo: (builder: QueryBuilder<transaction.Payments>) => {
        builder
          .select(
            "id",
            "invoice_number",
            "amount",
            "status",
            "paid_at",
            "payment_method_name",
            "payment_method_type"
          )
          .whereNull("deleted_at")
          .orderBy("created_at", "DESC");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const ordersPage: Page<transaction.Orders> = await query.page(page, limit);
    return ordersPage;
  }

  async findOne(
    id: string,
    {
      withUser,
      withCompany,
      withStatus,
      withDetails,
      withAddresses,
      withNotes,
      withPayments,
    }: OrderRelationParams = {}
  ): Promise<transaction.Orders> {
    let query = transaction.Orders.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    if (withUser) eagerGraph.user = { $modify: ["selectBasicUserInfo"] };
    if (withCompany) eagerGraph.company = { $modify: ["selectBasicCompanyInfo"] };
    if (withStatus) eagerGraph.statusRelation = { $modify: ["selectStatusInfo"] };
    if (withDetails) eagerGraph.details = {};
    if (withAddresses) eagerGraph.addresses = { $modify: ["activeAddressOnly"] };
    if (withNotes) eagerGraph.notes = { $modify: ["orderedNotes"] };
    if (withPayments) eagerGraph.payments = { $modify: ["selectPaymentInfo"] };

    const modifiers = {
      selectBasicUserInfo: (builder: QueryBuilder<user.Users>) => {
        builder.select("id", "name", "email").whereNull("deleted_at");
      },
      selectBasicCompanyInfo: (builder: QueryBuilder<company.Companies>) => {
        builder.select("id", "name", "company_code").whereNull("deleted_at");
      },
      selectStatusInfo: (builder: QueryBuilder<common.OrderStatus>) => {
        builder.select("id", "name", "alias").whereNull("deleted_at");
      },
      activeDetailsOnly: (builder: QueryBuilder<transaction.OrderDetails>) => {},
      orderedDetails: (builder: QueryBuilder<transaction.OrderDetails>) => {
        builder.orderBy("id", "ASC");
      },
      selectServiceName: (builder: QueryBuilder<service.Services>) => {
        builder.select("id", "name", "slug").whereNull("deleted_at");
      },
      selectFeeAmountName: (builder: QueryBuilder<transaction.OrderDetailFees>) => {
        builder.select("id", "fee_name", "value", "jumpapay_fee_id");
      },
      selectFeeCodeName: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder.select("id", "code", "name").whereNull("deleted_at");
      },
      selectDocType: (builder: QueryBuilder<transaction.OrderDetailDocuments>) => {
        builder.select("id", "type", "document", "created_at", "uploaded_by");
      },
      activeAddressOnly: (builder: QueryBuilder<transaction.OrderAddresses>) => {
        builder.orderBy("delivery_type", "ASC");
      },
      orderedNotes: (builder: QueryBuilder<transaction.OrderNotes>) => {
        builder.select("id", "note", "created_at", "created_by").orderBy("created_at", "DESC");
      },
      selectPaymentInfo: (builder: QueryBuilder<transaction.Payments>) => {
        builder
          .select(
            "id",
            "invoice_number",
            "amount",
            "status",
            "paid_at",
            "payment_method_name",
            "payment_method_type"
          )
          .whereNull("deleted_at")
          .orderBy("created_at", "DESC");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const order = await query;
    if (!order) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }
    return order;
  }

  async create(data: CreateOrderInput, trx?: Transaction): Promise<transaction.Orders> {
    if (!data.user_id && !data.company_id) {
      throw new BadRequestError("Either user_id or company_id must be provided.");
    }

    if (data.user_id) {
      const userExists = await user.Users.query(trx).findById(data.user_id).whereNull("deleted_at");
      if (!userExists) throw new BadRequestError(`User with ID ${data.user_id} not found.`);
    }
    if (data.company_id) {
      const companyExists = await company.Companies.query(trx)
        .findById(data.company_id)
        .whereNull("deleted_at");
      if (!companyExists)
        throw new BadRequestError(`Company with ID ${data.company_id} not found.`);
    }
    const statusExists = await common.OrderStatus.query(trx)
      .findById(data.order_status_id)
      .whereNull("deleted_at");
    if (!statusExists)
      throw new BadRequestError(`Order Status with ID ${data.order_status_id} not found.`);
    if (data.city_id) {
      const cityExists = await common.Cities.query(trx)
        .findById(data.city_id)
        .whereNull("deleted_at");
      if (!cityExists) throw new BadRequestError(`City with ID ${data.city_id} not found.`);
    }

    const orderData = {
      ...data,
    };

    const newOrder = await transaction.Orders.query(trx).insert(orderData).returning("*");
    return Array.isArray(newOrder) ? newOrder[0] : newOrder;
  }

  async update(id: string, data: UpdateOrderInput, trx?: Transaction): Promise<transaction.Orders> {
    const order = await transaction.Orders.query(trx).findById(id).whereNull("deleted_at");
    if (!order) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    /*
    // NOT DONE YET
    if (data.user_id && data.user_id !== order.user_id) {
    }
    if (data.company_id && data.company_id !== order.company_id) {
    }
    if (data.order_status_id && data.order_status_id !== order.order_status_id) {
    }
    if (data.city_id && data.city_id !== order.city_id) {
    }
    */

    const updatedOrders = await order.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedOrders) ? updatedOrders[0] : updatedOrders;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const order = await transaction.Orders.query(trx).findById(id).whereNull("deleted_at");
    if (!order) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    await order.$query(trx).patch({ deleted_at: new Date().toISOString() });

    return { message: `Order with ID ${id} deleted successfully` };
  }
}

export default new OrdersService();
