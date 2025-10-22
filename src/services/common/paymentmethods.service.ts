import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreatePaymentMethodInput = Pick<common.PaymentMethods, "name" | "type"> &
  Partial<Omit<common.PaymentMethods, "id" | "deleted_at">>;
type UpdatePaymentMethodInput = Partial<CreatePaymentMethodInput>;

interface FindAllPaymentMethodsOptions {
  limit: number;
  offset: number;
  search?: string;
  type?: common.PaymentMethods["type"];
  is_public?: boolean;
  is_active?: boolean;
  sort?: string;
}

export class PaymentMethodsService {
  async findAll({
    limit,
    offset,
    search,
    type,
    is_public,
    is_active,
    sort,
  }: FindAllPaymentMethodsOptions): Promise<Page<common.PaymentMethods>> {
    let query = common.PaymentMethods.query().whereNull("deleted_at");

    if (search) {
      query = query.where("name", "ilike", `%${search}%`);
    }
    if (type) {
      query = query.where("type", type);
    }
    if (typeof is_public === "boolean") {
      query = query.where("is_public", is_public);
    }
    if (typeof is_active === "boolean") {
      query = query.where("is_active", is_active);
    }

    if (sort) {
      const [column, direction] = sort.split(":");

      const allowedSortColumns = ["id", "name", "type", "is_public", "is_active", "max_amount"];
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
    const paymentMethodsPage: Page<common.PaymentMethods> = await query.page(page, limit);
    return paymentMethodsPage;
  }

  async findOne(id: number): Promise<common.PaymentMethods> {
    const paymentMethod = await common.PaymentMethods.query().findById(id).whereNull("deleted_at");
    if (!paymentMethod) {
      throw new NotFoundError(`Payment Method with ID ${id} not found`);
    }
    return paymentMethod;
  }

  async create(data: CreatePaymentMethodInput, trx?: Transaction): Promise<common.PaymentMethods> {
    const newPaymentMethod = await common.PaymentMethods.query(trx).insert(data).returning("*");
    return Array.isArray(newPaymentMethod) ? newPaymentMethod[0] : newPaymentMethod;
  }

  async update(
    id: number,
    data: UpdatePaymentMethodInput,
    trx?: Transaction
  ): Promise<common.PaymentMethods> {
    const paymentMethod = await common.PaymentMethods.query(trx)
      .findById(id)
      .whereNull("deleted_at");
    if (!paymentMethod) {
      throw new NotFoundError(`Payment Method with ID ${id} not found`);
    }
    const updatedPaymentMethods = await paymentMethod.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedPaymentMethods) ? updatedPaymentMethods[0] : updatedPaymentMethods;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const paymentMethod = await common.PaymentMethods.query(trx)
      .findById(id)
      .whereNull("deleted_at");
    if (!paymentMethod) {
      throw new NotFoundError(`Payment Method with ID ${id} not found`);
    }
    await paymentMethod.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Payment Method with ID ${id} deleted successfully` };
  }
}

export default new PaymentMethodsService();
