import { transaction, user } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";
import { v4 as uuidv4 } from "uuid";
import path from "path";

type DeliveryTypeValue = "RETURN" | "PICKUP";

type UpdateCourierEvidenceInput = Partial<Pick<transaction.CourierEvidences, "delivery_type">>;
type CourierEvidenceRelationParams = {
  withOrder?: boolean;
  withUser?: boolean;
};

type CreateCourierEvidenceInput = Pick<
  transaction.CourierEvidences,
  "order_id" | "user_id" | "delivery_type"
> & {
  fileUrl: string;
  fileType: string;
};

interface FindAllCourierEvidencesOptions extends CourierEvidenceRelationParams {
  limit: number;
  offset: number;
  order_id: string;
  user_id?: string;
  delivery_type?: DeliveryTypeValue;
  sort?: string;
}

export class CourierEvidencesService {
  private T_EVIDENCES = transaction.CourierEvidences.tableName;
  private T_ORDERS = transaction.Orders.tableName;
  private T_USERS = user.Users.tableName;

  async findAll({
    limit,
    offset,
    order_id,
    user_id,
    delivery_type,
    sort,
    withOrder,
    withUser,
  }: FindAllCourierEvidencesOptions): Promise<Page<transaction.CourierEvidences>> {
    let query = transaction.CourierEvidences.query().whereNull(`${this.T_EVIDENCES}.deleted_at`);

    query = query.where(`${this.T_EVIDENCES}.order_id`, order_id);
    if (user_id) query = query.where(`${this.T_EVIDENCES}.user_id`, user_id);
    if (delivery_type) query = query.where(`${this.T_EVIDENCES}.delivery_type`, delivery_type);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "user_id", "delivery_type", "created_at"];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${this.T_EVIDENCES}.${column}`
        : `${this.T_EVIDENCES}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${this.T_EVIDENCES}.created_at`, "DESC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };
    if (withUser) eagerGraph.user = { $modify: ["selectUserInfo"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const evidencesPage: Page<transaction.CourierEvidences> = await query.page(page, limit);
    return evidencesPage;
  }

  async findOne(
    id: string,
    { withOrder, withUser }: CourierEvidenceRelationParams = {}
  ): Promise<transaction.CourierEvidences> {
    let query = transaction.CourierEvidences.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withOrder) eagerGraph.order = { $modify: ["selectBasicOrder"] };
    if (withUser) eagerGraph.user = { $modify: ["selectUserInfo"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const evidence = await query;
    if (!evidence) {
      throw new NotFoundError(`Courier Evidence with ID ${id} not found`);
    }
    return evidence;
  }

  async create(
    data: CreateCourierEvidenceInput,
    trx?: Transaction
  ): Promise<transaction.CourierEvidences> {
    const orderExists = await transaction.Orders.query(trx)
      .findById(data.order_id)
      .whereNull("deleted_at");
    if (!orderExists) throw new BadRequestError(`Order with ID ${data.order_id} not found.`);

    const userExists = await user.Users.query(trx).findById(data.user_id).whereNull("deleted_at");
    if (!userExists) throw new BadRequestError(`User (Courier) with ID ${data.user_id} not found.`);

    const evidenceData: Partial<transaction.CourierEvidences> = {
      id: uuidv4(),
      order_id: data.order_id,
      user_id: data.user_id,
      delivery_type: data.delivery_type,
      file: data.fileUrl,
      file_type: data.fileType as transaction.CourierEvidences["file_type"],
    };

    const newEvidence = await transaction.CourierEvidences.query(trx)
      .insert(evidenceData)
      .returning("*");
    return Array.isArray(newEvidence) ? newEvidence[0] : newEvidence;
  }

  async update(
    id: string,
    data: UpdateCourierEvidenceInput,
    trx?: Transaction
  ): Promise<transaction.CourierEvidences> {
    const evidence = await transaction.CourierEvidences.query(trx)
      .findById(id)
      .whereNull("deleted_at");
    if (!evidence) {
      throw new NotFoundError(`Courier Evidence with ID ${id} not found`);
    }

    const updatedEvidences = await evidence.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedEvidences) ? updatedEvidences[0] : updatedEvidences;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const evidence = await transaction.CourierEvidences.query(trx)
      .findById(id)
      .whereNull("deleted_at");
    if (!evidence) {
      throw new NotFoundError(`Courier Evidence with ID ${id} not found`);
    }

    await evidence.$query(trx).patch({ deleted_at: new Date().toISOString() });

    return { message: `Courier Evidence with ID ${id} deleted successfully` };
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
      selectUserInfo: (builder: QueryBuilder<user.Users>) => {
        builder
          .select(`${this.T_USERS}.id`, `${this.T_USERS}.name`, `${this.T_USERS}.email`)
          .whereNull(`${this.T_USERS}.deleted_at`);
      },
    };
  }
}

export default new CourierEvidencesService();
