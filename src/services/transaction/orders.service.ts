import { transaction, common, user, company, service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { ModelObject, Page, QueryBuilder, raw, Transaction } from "objection";
import { gmapsLink } from "@utils/helpers";

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
  isPaid?: boolean;
  isCompleted?: boolean;
}

interface Courier {
  id: string;
  name: string;
  phone: string;
}

interface OrderDetail extends ModelObject<transaction.OrderDetails> {
  service_name: string;
  samsat_name: string;
  documents: transaction.OrderDetailDocuments;
  formDatas: transaction.OrderFormDatas;
  fees: transaction.OrderDetailFees;
}

interface Order extends ModelObject<transaction.Orders> {
  user_name: string;
  user_phone: string;
  company_name: string;
  order_status_name: string;
  order_code: string;
  details: transaction.OrderDetails &
    {
      service_name: string;
      samsat_name: string;
      documents: transaction.OrderDetailDocuments;
      formDatas: transaction.OrderFormDatas;
      fees: transaction.OrderDetailFees;
    }[];
  orderAddresses?: transaction.OrderAddresses &
    {
      user?: Courier;
      courier?: Courier;
    }[];
  notes: transaction.OrderNotes;
}

interface GroupedFee {
  group_name: string;
  order_group: number;
  items: transaction.OrderDetailFees[];
}

interface Fee {
  id: string;
  fee_name: string;
  value: number;
  order: number;
};

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

  async findAllB2C({
    limit,
    offset,
    user_id,
    order_status_id,
    booking_id,
    phone,
    city_id,
    source,
    status,
    payment_type,
    paid_at_start,
    paid_at_end,
    created_at_start,
    created_at_end,
    sort,
    isPaid,
    isCompleted,
  }: FindAllOrdersOptions): Promise<Page<transaction.Orders>> {
    const T_ORDERS = transaction.Orders.tableName;
    let query = transaction.Orders.query()
      .select(
        `${T_ORDERS}.id`,
        `${T_ORDERS}.user_id`,
        "users.name as user_name",
        "users.phone as user_phone",
        `${T_ORDERS}.company_id`,
        "companies.name as company_name",
        `${T_ORDERS}.order_status_id`,
        "order_status.name as order_status_name",
        "order_status.code as order_code",
        `${T_ORDERS}.booking_id`,
        `${T_ORDERS}.phone`,
        `${T_ORDERS}.source`,
        `${T_ORDERS}.status`,
        `${T_ORDERS}.paid_at`,
        `${T_ORDERS}.payment_type`,
        `${T_ORDERS}.created_at`,
        `${T_ORDERS}.email`,
        `${T_ORDERS}.price`
      )
      .leftJoin("company.companies", "companies.id", `${T_ORDERS}.company_id`)
      .leftJoin("user.users", "users.id", `${T_ORDERS}.user_id`)
      .leftJoin("common.order_status", "order_status.id", `${T_ORDERS}.order_status_id`)
      .where(`${T_ORDERS}.order_category`, "B2C")
      .whereNull(`${T_ORDERS}.deleted_at`);

    if (isPaid !== null) {
      if (isPaid === true) {
        query = query
          .whereNotNull(`${T_ORDERS}.paid_at`)
          .whereRaw("order_status.code IS DISTINCT FROM ?", ["COMPLETED"]);
      } else if (isPaid === false) {
        query = query.whereNull(`${T_ORDERS}.paid_at`);
      }
    }
    if (isCompleted)
      query = query.where("order_status.code", "COMPLETED").whereNotNull(`${T_ORDERS}.paid_at`);
    if (user_id) query = query.where(`${T_ORDERS}.user_id`, user_id);
    if (order_status_id) query = query.where(`${T_ORDERS}.order_status_id`, order_status_id);
    if (booking_id) query = query.where(`${T_ORDERS}.booking_id`, "ilike", `%${booking_id}%`);
    if (phone) query = query.where(`${T_ORDERS}.phone`, "ilike", `%${phone}%`);
    if (city_id) query = query.where(`${T_ORDERS}.city_id`, city_id);
    if (source) query = query.where(`${T_ORDERS}.source`, "ilike", `%${source}%`);
    if (status) query = query.where(`${T_ORDERS}.status`, "ilike", `%${status}%`);
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
        "phone",
        "source",
        "order_status_id",
        "booking_id",
        "created_at",
        "paid_at",
        "price",
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

    // console.log(query.toKnexQuery().toSQL().toNative())
    const T_ORDER_DETAILS: string = transaction.OrderDetails.tableName;
    const eagerGraph: Record<string, any> = {};
    eagerGraph.details = {
      $modify: ["orderDetails"],
    };
    // eagerGraph.addresses = { $modify: ["activeAddressOnly"] };

    const modifiers = {
      orderDetails: (builder: QueryBuilder<transaction.OrderDetails>) => {
        builder
          .select(
            `${T_ORDER_DETAILS}.id`,
            `${T_ORDER_DETAILS}.service_id`,
            "services.name as service_name",
            `${T_ORDER_DETAILS}.price`,
            `${T_ORDER_DETAILS}.is_stnk_equals_ktp`,
            `${T_ORDER_DETAILS}.is_stnk_equals_bpkb`,
            `${T_ORDER_DETAILS}.is_same_location`,
            `${T_ORDER_DETAILS}.name as user_name`,
            `${T_ORDER_DETAILS}.samsat_id`,
            "samsat.name as samsat_name",
            raw(`
            CASE 
              WHEN samsat.latitude IS NOT NULL AND samsat.longitude IS NOT NULL 
              THEN CONCAT(samsat.latitude, ',', samsat.longitude)
              ELSE NULL
            END AS samsat_long_lat
          `),
            raw(
              `CONCAT(${T_ORDER_DETAILS}.plate_prefix, ' ', ${T_ORDER_DETAILS}.plate_number, ' ', ${T_ORDER_DETAILS}.plate_serial) as plate`
            )
          )
          .leftJoin("service.services", "services.id", `${T_ORDER_DETAILS}.service_id`)
          .leftJoin("common.samsat", "samsat.id", `${T_ORDER_DETAILS}.samsat_id`)
          .orderBy("id", "ASC");
      },
      activeAddressOnly: (builder: QueryBuilder<transaction.OrderAddresses>) => {
        builder.orderBy("delivery_type", "ASC");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const ordersPage: Page<transaction.Orders> = await query.page(page, limit);
    return ordersPage;
  }

  async findOne(id: string): Promise<Order> {
    const T_ORDERS = transaction.Orders.tableName;
    let query = transaction.Orders.query()
      .findById(id)
      .select(
        `${T_ORDERS}.id`,
        `${T_ORDERS}.user_id`,
        "users.name as user_name",
        "users.phone as user_phone",
        `${T_ORDERS}.company_id`,
        "companies.name as company_name",
        `${T_ORDERS}.order_status_id`,
        "order_status.name as order_status_name",
        "order_status.code as order_code",
        `${T_ORDERS}.order_category`,
        `${T_ORDERS}.order_type`,
        `${T_ORDERS}.pickup_date`,
        `${T_ORDERS}.order_position`,
        `${T_ORDERS}.booking_id`,
        `${T_ORDERS}.phone`,
        `${T_ORDERS}.source`,
        `${T_ORDERS}.status`,
        `${T_ORDERS}.paid_at`,
        `${T_ORDERS}.payment_type`,
        `${T_ORDERS}.created_at`,
        `${T_ORDERS}.email`,
        `${T_ORDERS}.price`
      )
      .leftJoin("company.companies", "companies.id", `${T_ORDERS}.company_id`)
      // .leftJoin("transaction.payment_items", "payment_items.order_id", `${T_ORDERS}.id`)
      // .leftJoin("transaction.payments", "payments.id", `payment_items.payment_id`)
      .leftJoin("user.users", "users.id", `${T_ORDERS}.user_id`)
      .leftJoin("common.order_status", "order_status.id", `${T_ORDERS}.order_status_id`)
      .where(`${T_ORDERS}.order_category`, "B2C")
      .whereNull(`${T_ORDERS}.deleted_at`);

    const T_ORDER_DETAILS: string = transaction.OrderDetails.tableName;
    const T_ORDER_ADDRESS: string = transaction.OrderAddresses.tableName;
    const T_ORDER_NOTES: string = transaction.OrderNotes.tableName;
    const T_ORDER_DOCUMENTS: string = transaction.OrderDetailDocuments.tableName;
    const T_ORDER_FORM_DATAS: string = transaction.OrderFormDatas.tableName;
    const T_ORDER_DETAIL_FEES: string = transaction.OrderDetailFees.tableName;
    const T_PAYMENT_ITEMS: string = transaction.PaymentItems.tableName;
    const T_PAYMENTS: string = transaction.Payments.tableName;
    const T_ORDER_VOUCHERS: string = transaction.OrderVouchers.tableName;
    const T_USERS: string = user.Users.tableName;
    const eagerGraph: Record<string, any> = {};

    eagerGraph.details = {
      $modify: ["orderDetails"],
      documents: {
        $modify: ["orderDetailDocuments"],
      },
      formDatas: {
        $modify: ["orderFormDatas"],
      },
      fees: {
        $modify: ["orderFees"],
      },
    };
    eagerGraph.orderAddresses = {
      $modify: ["orderAddresses"],
      user: {
        $modify: ["selectCourier"],
      },
    };
    eagerGraph.notes = {
      $modify: ["orderNotes"],
    };
    eagerGraph.paymentItems = {
      $modify: ["orderPaymentItems"],
    };
    eagerGraph.orderVouchers = {
      $modify: ["orderVouchers"],
    };

    const modifiers = {
      orderDetails: (builder: QueryBuilder<transaction.OrderDetails>) => {
        builder
          .select(
            `${T_ORDER_DETAILS}.id`,
            `${T_ORDER_DETAILS}.service_id`,
            "services.name as service_name",
            `${T_ORDER_DETAILS}.price`,
            `${T_ORDER_DETAILS}.is_stnk_equals_ktp`,
            `${T_ORDER_DETAILS}.is_stnk_equals_bpkb`,
            `${T_ORDER_DETAILS}.is_same_location`,
            `${T_ORDER_DETAILS}.name as user_name`,
            `${T_ORDER_DETAILS}.samsat_id`,
            "samsat.name as samsat_name",
            raw(`
            CASE 
              WHEN samsat.latitude IS NOT NULL AND samsat.longitude IS NOT NULL 
              THEN CONCAT(samsat.latitude, ',', samsat.longitude)
              ELSE NULL
            END AS samsat_long_lat
          `),
            raw(
              `CONCAT(${T_ORDER_DETAILS}.plate_prefix, ' ', ${T_ORDER_DETAILS}.plate_number, ' ', ${T_ORDER_DETAILS}.plate_serial) as plate`
            )
          )
          .leftJoin("service.services", "services.id", `${T_ORDER_DETAILS}.service_id`)
          .leftJoin("common.samsat", "samsat.id", `${T_ORDER_DETAILS}.samsat_id`)
          .orderBy("id", "ASC");
      },
      orderDetailDocuments: (builder: QueryBuilder<transaction.OrderDetailDocuments>) => {
        builder
          .select(
            `${T_ORDER_DOCUMENTS}.id`,
            `${T_ORDER_DOCUMENTS}.uploaded_by`,
            `${T_ORDER_DOCUMENTS}.type`,
            `${T_ORDER_DOCUMENTS}.document`,
            `${T_ORDER_DOCUMENTS}.created_at`
          )
          .orderBy(`${T_ORDER_DOCUMENTS}.created_at`, "DESC");
      },
      orderFormDatas: (builder: QueryBuilder<transaction.OrderFormDatas>) => {
        builder
          .select(
            `${T_ORDER_FORM_DATAS}.id`,
            `${T_ORDER_FORM_DATAS}.form_token`,
            `${T_ORDER_FORM_DATAS}.form_data`,
            `${T_ORDER_FORM_DATAS}.created_at`
          )
          .orderBy(`${T_ORDER_FORM_DATAS}.created_at`, "DESC");
      },
      orderFees: (builder: QueryBuilder<transaction.OrderDetailFees>) => {
        builder
          .select(
            `${T_ORDER_DETAIL_FEES}.id`,
            `${T_ORDER_DETAIL_FEES}.fee_name`,
            `${T_ORDER_DETAIL_FEES}.value`,
            `${T_ORDER_DETAIL_FEES}.fee_group_name`,
            `${T_ORDER_DETAIL_FEES}.order_fee_name`,
            `${T_ORDER_DETAIL_FEES}.order_fee_group`
          )
          .orderBy(`${T_ORDER_DETAIL_FEES}.order_fee_name`, "ASC");
      },
      orderAddresses: (builder: QueryBuilder<transaction.OrderAddresses>) => {
        builder.select(
          `${T_ORDER_ADDRESS}.id`,
          `${T_ORDER_ADDRESS}.city_name`,
          `${T_ORDER_ADDRESS}.province_name`,
          `${T_ORDER_ADDRESS}.raw_address`,
          `${T_ORDER_ADDRESS}.landmark`,
          `${T_ORDER_ADDRESS}.longitude`,
          `${T_ORDER_ADDRESS}.latitude`,
          `${T_ORDER_ADDRESS}.price`,
          `${T_ORDER_ADDRESS}.scheduled_date`,
          `${T_ORDER_ADDRESS}.status`,
          `${T_ORDER_ADDRESS}.delivery_type`
        );
      },
      orderNotes: (builder: QueryBuilder<transaction.OrderNotes>) => {
        builder
          .select(
            `${T_ORDER_NOTES}.id`,
            `${T_ORDER_NOTES}.note`,
            `${T_ORDER_NOTES}.created_by`,
            `${T_ORDER_NOTES}.created_at`
          )
          .orderBy(`${T_ORDER_NOTES}.created_at`, "DESC");
      },
      orderPaymentItems: (builder: QueryBuilder<transaction.Payments>) => {
        builder
          .select(
            `${T_PAYMENTS}.id`,
            `${T_PAYMENTS}.company_id`,
            `${T_PAYMENTS}.payment_gateway_ref`,
            `${T_PAYMENTS}.invoice_number`,
            `${T_PAYMENTS}.amount`,
            `${T_PAYMENTS}.payment_method_name`,
            `${T_PAYMENTS}.payment_method_type`,
            `${T_PAYMENTS}.status`,
            `${T_PAYMENTS}.paid_at`,
            `${T_PAYMENTS}.payment_details`,
            `${T_PAYMENTS}.created_at`,
          )
          .leftJoin("transaction.payments", "payments.id", `${T_PAYMENT_ITEMS}.payment_id`)
          .orderBy(`${T_PAYMENTS}.created_at`, "DESC");
      },
      orderVouchers: (builder: QueryBuilder<transaction.OrderVouchers & {code: string}>) => {
        builder
          .select(
            `${T_ORDER_VOUCHERS}.id`,
            `vouchers.code`,
            `${T_ORDER_VOUCHERS}.applied_target_type`,
            `${T_ORDER_VOUCHERS}.applied_discount_amount`,
            `${T_ORDER_VOUCHERS}.created_at`
          )
          .leftJoin(`common.vouchers`, "vouchers.id", `${T_ORDER_VOUCHERS}.voucher_id`)
          .orderBy(`${T_ORDER_VOUCHERS}.created_at`, "DESC");
      },
      selectCourier: (builder: QueryBuilder<transaction.OrderDetails>) => {
        builder.select(`${T_USERS}.id`, `${T_USERS}.name`, `${T_USERS}.phone`);
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

    const result = (await query) as unknown as Order;
    if (!result) {
      throw new NotFoundError(`Order with ID ${id} not found`);
    }

    const { orderAddresses, details, ...resResult } = result;
    
    //#region - Order Details
    const orderDetails = details.map((detailOrder) => {
      const { fees: orderDetailFees, ...restOrderDetails } = detailOrder;
      //#region - Grouping Fees
      const feesArray: transaction.OrderDetailFees[] = Array.isArray(orderDetailFees)
        ? orderDetailFees
        : orderDetailFees
          ? [orderDetailFees]
          : [];
      const groupedFees = Object.values(
        feesArray.reduce<
          Record<
            string,
            {
              group_name: string;
              order: number;
              items: Fee[]
            }
          >
        >((acc, item) => {
          const { fee_group_name: groupName, order_fee_group: orderGroup } = item;
          if (groupName) {
            acc[groupName] = acc[groupName] || {
              group_name: groupName,
              order: orderGroup,
              items: [],
            };
            const {
              fee_group_name,
              order_fee_name,
              order_fee_group,
              ...restFee
            } = item;
            acc[groupName].items.push({
              ...restFee,
              order: Number(order_fee_name || "99"),
              value: restFee.value ?? 0
            });
          }
          return acc;
        }, {})
      )
        .map((g) => ({
          ...g,
          items: g.items.sort((a, b) => {
            const aOrder = Number(a.order) || 0;
            const bOrder = Number(b.order) || 0;
            return aOrder - bOrder;
          }),
        }))
        .sort((a, b) => a.order - b.order);
      //#endregion - Grouping Fees

      return {
        ...restOrderDetails,
        fees: groupedFees,
      };
    });
    //#endregion - Order Details

    const orderAddressesModified = orderAddresses as unknown as transaction.OrderAddresses & {user: any[]}[];
    const order = {
      ...resResult,
      orderDetails,
      address: orderAddressesModified
        ? orderAddressesModified.map(({ user, ...res }) => ({
          ...res,
          maps_link: (res as any)?.longitude && (res as any)?.latitude ? gmapsLink((res as any).longitude, (res as any).latitude) : null,
          courier: user
        }))
        : [],
    };

    return order as unknown as Order;
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
