import { transaction } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";
import { v4 as uuidv4 } from "uuid";

type CreateOrderNoteInput = Pick<transaction.OrderNotes, "note" | "created_by">;
type UpdateOrderNoteInput = Partial<Pick<transaction.OrderNotes, "note">>;
type OrderNoteRelationParams = {
  withOrder?: boolean;
};

interface FindAllOrderNotesOptions extends OrderNoteRelationParams {
  limit: number;
  offset: number;
  order_id: string;
  sort?: string;
}

export class OrderNotesService {
  private T_NOTES = transaction.OrderNotes.tableName;
  private T_ORDERS = transaction.Orders.tableName;

  async findAll({
    limit,
    offset,
    order_id,
    sort,
    withOrder,
  }: FindAllOrderNotesOptions): Promise<Page<transaction.OrderNotes>> {
    let query = transaction.OrderNotes.query().whereNull(`${this.T_NOTES}.deleted_at`);

    query = query.where(`${this.T_NOTES}.order_id`, order_id);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "created_at"];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${this.T_NOTES}.${column}`
        : `${this.T_NOTES}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${this.T_NOTES}.created_at`, "DESC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const notesPage: Page<transaction.OrderNotes> = await query.page(page, limit);
    return notesPage;
  }

  async findOne(
    id: string,
    order_id: string,
    { withOrder }: OrderNoteRelationParams = {}
  ): Promise<transaction.OrderNotes> {
    let query = transaction.OrderNotes.query()
      .findById(id)
      .where(`${this.T_NOTES}.order_id`, order_id)
      .whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const orderNote = await query;
    if (!orderNote) {
      throw new NotFoundError(`Order Note with ID ${id} not found for Order ID ${order_id}`);
    }
    return orderNote;
  }

  async create(
    order_id: string,
    data: CreateOrderNoteInput,
    trx?: Transaction
  ): Promise<transaction.OrderNotes> {
    const orderExists = await transaction.Orders.query(trx)
      .findById(order_id)
      .whereNull("deleted_at");
    if (!orderExists) throw new BadRequestError(`Order with ID ${order_id} not found.`);

    const noteData = {
      id: uuidv4(),
      order_id: order_id,
      ...data,
    };

    const newNote = await transaction.OrderNotes.query(trx).insert(noteData).returning("*");
    return Array.isArray(newNote) ? newNote[0] : newNote;
  }

  async update(
    id: string,
    order_id: string,
    data: UpdateOrderNoteInput,
    trx?: Transaction
  ): Promise<transaction.OrderNotes> {
    const orderNote = await transaction.OrderNotes.query(trx)
      .findById(id)
      .where(`${this.T_NOTES}.order_id`, order_id)
      .whereNull("deleted_at");

    if (!orderNote) {
      throw new NotFoundError(`Order Note with ID ${id} not found for Order ID ${order_id}`);
    }

    const updatedNotes = await orderNote.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedNotes) ? updatedNotes[0] : updatedNotes;
  }

  async remove(id: string, order_id: string, trx?: Transaction): Promise<{ message: string }> {
    const orderNote = await transaction.OrderNotes.query(trx)
      .findById(id)
      .where(`${this.T_NOTES}.order_id`, order_id)
      .whereNull("deleted_at");

    if (!orderNote) {
      throw new NotFoundError(`Order Note with ID ${id} not found for Order ID ${order_id}`);
    }

    await orderNote.$query(trx).patch({ deleted_at: new Date().toISOString() });

    return { message: `Order Note with ID ${id} deleted successfully` };
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
    };
  }
}

export default new OrderNotesService();
