import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError } from "../../utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateOrderStatusInput = Pick<common.OrderStatus, "name"> &
  Partial<Pick<common.OrderStatus, "alias" | "is_tag" | "is_active">>;
type UpdateOrderStatusInput = Partial<CreateOrderStatusInput>;

interface FindAllOrderStatusOptions {
  limit: number;
  offset: number;
  search?: string;
  is_active?: boolean;
  is_tag?: boolean;
  sort?: string;
}

export class OrderStatusService {
  async findAll({
    limit,
    offset,
    search,
    is_active,
    is_tag,
    sort,
  }: FindAllOrderStatusOptions): Promise<Page<common.OrderStatus>> {
    let query = common.OrderStatus.query().whereNull("deleted_at");

    if (search) {
      query = query.where((builder) => {
        builder.where("name", "ilike", `%${search}%`).orWhere("alias", "ilike", `%${search}%`);
      });
    }

    if (typeof is_active === "boolean") {
      query = query.where("is_active", is_active);
    }
    if (typeof is_tag === "boolean") {
      query = query.where("is_tag", is_tag);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "name", "alias", "is_active", "is_tag"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("name", "ASC");
    }

    const page = Math.floor(offset / limit);
    const orderStatusPage: Page<common.OrderStatus> = await query.page(page, limit);
    return orderStatusPage;
  }

  async findOne(id: number): Promise<common.OrderStatus> {
    const orderStatus = await common.OrderStatus.query().findById(id).whereNull("deleted_at");
    if (!orderStatus) {
      throw new NotFoundError(`Order Status with ID ${id} not found`);
    }
    return orderStatus;
  }

  async create(data: CreateOrderStatusInput, trx?: Transaction): Promise<common.OrderStatus> {
    const newOrderStatus = await common.OrderStatus.query(trx).insert(data).returning("*");
    return Array.isArray(newOrderStatus) ? newOrderStatus[0] : newOrderStatus;
  }

  async update(
    id: number,
    data: UpdateOrderStatusInput,
    trx?: Transaction
  ): Promise<common.OrderStatus> {
    const orderStatus = await common.OrderStatus.query(trx).findById(id).whereNull("deleted_at");
    if (!orderStatus) {
      throw new NotFoundError(`Order Status with ID ${id} not found`);
    }
    const updatedOrderStatus = await orderStatus.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedOrderStatus) ? updatedOrderStatus[0] : updatedOrderStatus;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const orderStatus = await common.OrderStatus.query(trx).findById(id).whereNull("deleted_at");
    if (!orderStatus) {
      throw new NotFoundError(`Order Status with ID ${id} not found`);
    }
    await orderStatus.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Order Status with ID ${id} deleted successfully` };
  }
}

export default new OrderStatusService();
