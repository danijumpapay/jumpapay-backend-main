import { transaction, common, user, customer, service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";
import { v4 as uuidv4 } from "uuid";

type DeliveryTypeValue = "RETURN" | "PICKUP";
type OrderAddressStatusValue = "WAITING FOR DRIVER" | "ON THE WAY" | "COMPLETED";

type CreateOrderAddressInput = Omit<transaction.OrderAddresses, "id" | "created_at">;
type UpdateOrderAddressInput = Partial<
  Omit<transaction.OrderAddresses, "id" | "created_at" | "order_id" | "address_id" | "user_id">
>;
type OrderAddressRelationParams = {
  withOrder?: boolean;
  withUser?: boolean;
  withAddress?: boolean;
};

interface FindAllOrderAddressesOptions extends OrderAddressRelationParams {
  limit: number;
  offset: number;
  order_id?: string;
  user_id?: string;
  address_id?: string;
  delivery_type?: DeliveryTypeValue;
  status?: OrderAddressStatusValue;
  scheduled_date?: string;
  sort?: string;
}

export class OrderAddressesService {
  private T_ADDRESSES = transaction.OrderAddresses.tableName;
  private T_ORDERS = transaction.Orders.tableName;
  private T_USERS = user.Users.tableName;
  private T_CUST_ADDR = customer.Addresses.tableName;

  async findAll({
    limit,
    offset,
    order_id,
    user_id,
    address_id,
    delivery_type,
    status,
    scheduled_date,
    sort,
    withOrder,
    withUser,
    withAddress,
  }: FindAllOrderAddressesOptions): Promise<Page<transaction.OrderAddresses>> {
    let query = transaction.OrderAddresses.query();

    if (order_id) query = query.where(`${this.T_ADDRESSES}.order_id`, order_id);
    if (user_id) query = query.where(`${this.T_ADDRESSES}.user_id`, user_id);
    if (address_id) query = query.where(`${this.T_ADDRESSES}.address_id`, address_id);
    if (delivery_type) query = query.where(`${this.T_ADDRESSES}.delivery_type`, delivery_type);
    if (status) query = query.where(`${this.T_ADDRESSES}.status`, status);
    if (scheduled_date)
      query = query.whereRaw("??::date = ?", [
        `${this.T_ADDRESSES}.scheduled_date`,
        scheduled_date,
      ]);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = [
        "id",
        "order_id",
        "scheduled_date",
        "status",
        "delivery_type",
        "created_at",
      ];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${this.T_ADDRESSES}.${column}`
        : `${this.T_ADDRESSES}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${this.T_ADDRESSES}.created_at`, "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };
    if (withUser) eagerGraph.user = { $modify: ["selectBasicUser"] };
    if (withAddress) eagerGraph.address = { $modify: ["selectAddressDetails"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const addressesPage: Page<transaction.OrderAddresses> = await query.page(page, limit);
    return addressesPage;
  }

  async findOne(
    id: string,
    { withOrder, withUser, withAddress }: OrderAddressRelationParams = {}
  ): Promise<transaction.OrderAddresses> {
    let query = transaction.OrderAddresses.query().findById(id);

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };
    if (withUser) eagerGraph.user = { $modify: ["selectBasicUser"] };
    if (withAddress) eagerGraph.address = { $modify: ["selectAddressDetails"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const orderAddress = await query;
    if (!orderAddress) {
      throw new NotFoundError(`Order Address with ID ${id} not found`);
    }
    return orderAddress;
  }

  async create(
    data: CreateOrderAddressInput,
    trx?: Transaction
  ): Promise<transaction.OrderAddresses> {
    const orderExists = await transaction.Orders.query(trx)
      .findById(data.order_id)
      .whereNull("deleted_at");
    if (!orderExists) throw new BadRequestError(`Order with ID ${data.order_id} not found.`);

    if (data.user_id) {
      const userExists = await user.Users.query(trx).findById(data.user_id).whereNull("deleted_at");
      if (!userExists) throw new BadRequestError(`User with ID ${data.user_id} not found.`);
    }
    if (data.address_id) {
      const addressExists = await customer.Addresses.query(trx)
        .findById(data.address_id)
        .whereNull("deleted_at");
      if (!addressExists)
        throw new BadRequestError(`Customer Address with ID ${data.address_id} not found.`);
    } else if (!data.raw_address || !data.city_name || !data.province_name) {
      throw new BadRequestError(
        "If address_id is not provided, raw_address, city_name, and province_name are required."
      );
    }

    const addressData = {
      id: uuidv4(),
      ...data,
    };

    const newAddress = await transaction.OrderAddresses.query(trx)
      .insert(addressData)
      .returning("*");
    return Array.isArray(newAddress) ? newAddress[0] : newAddress;
  }

  async update(
    id: string,
    data: UpdateOrderAddressInput,
    trx?: Transaction
  ): Promise<transaction.OrderAddresses> {
    const orderAddress = await transaction.OrderAddresses.query(trx).findById(id);
    if (!orderAddress) {
      throw new NotFoundError(`Order Address with ID ${id} not found`);
    }

    const updatedAddresses = await orderAddress.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedAddresses) ? updatedAddresses[0] : updatedAddresses;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await transaction.OrderAddresses.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`Order Address with ID ${id} not found`);
    }
    return { message: `Order Address with ID ${id} deleted successfully` };
  }

  private getEagerModifiers() {
    return {
      selectBasicOrder: (builder: QueryBuilder<transaction.Orders>) => {
        builder
          .select(
            `${this.T_ORDERS}.id`,
            `${this.T_ORDERS}.booking_id`,
            `${this.T_ORDERS}.created_at`
          )
          .whereNull(`${this.T_ORDERS}.deleted_at`);
      },
      selectBasicUser: (builder: QueryBuilder<user.Users>) => {
        builder
          .select(`${this.T_USERS}.id`, `${this.T_USERS}.name`, `${this.T_USERS}.email`)
          .whereNull(`${this.T_USERS}.deleted_at`);
      },
      selectAddressDetails: (builder: QueryBuilder<customer.Addresses>) => {
        builder.whereNull(`${this.T_CUST_ADDR}.deleted_at`);
      },
    };
  }
}

export default new OrderAddressesService();
