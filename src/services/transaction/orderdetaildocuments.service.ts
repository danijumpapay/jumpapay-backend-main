import { transaction, user } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type DocumentTypeValue = "STNK" | "BPKB" | "SKPD" | "KTP" | "OTHERS";

type CreateOrderDetailDocumentInput = Pick<
  transaction.OrderDetailDocuments,
  "order_detail_id" | "uploaded_by" | "type" | "document"
>;
type UpdateOrderDetailDocumentInput = Partial<
  Pick<transaction.OrderDetailDocuments, "type" | "document">
>;
type OrderDetailDocumentRelationParams = {
  withDetail?: boolean;
  withUploader?: boolean;
};

interface FindAllOrderDetailDocumentsOptions extends OrderDetailDocumentRelationParams {
  limit: number;
  offset: number;
  order_detail_id?: string;
  uploaded_by?: string;
  type?: DocumentTypeValue;
  sort?: string;
}

export class OrderDetailDocumentsService {
  private T_DOCS = transaction.OrderDetailDocuments.tableName;
  private T_DETAILS = transaction.OrderDetails.tableName;
  private T_USERS = user.Users.tableName;

  async findAll({
    limit,
    offset,
    order_detail_id,
    uploaded_by,
    type,
    sort,
    withDetail,
    withUploader,
  }: FindAllOrderDetailDocumentsOptions): Promise<Page<transaction.OrderDetailDocuments>> {
    let query = transaction.OrderDetailDocuments.query();

    if (order_detail_id) query = query.where(`${this.T_DOCS}.order_detail_id`, order_detail_id);
    if (uploaded_by) query = query.where(`${this.T_DOCS}.uploaded_by`, uploaded_by);
    if (type) query = query.where(`${this.T_DOCS}.type`, type);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "order_detail_id", "uploaded_by", "type", "created_at"];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${this.T_DOCS}.${column}`
        : `${this.T_DOCS}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${this.T_DOCS}.created_at`, "DESC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withDetail) eagerGraph.detail = { $modify: ["selectDetailInfo"] };
    if (withUploader) eagerGraph.uploader = { $modify: ["selectUploaderInfo"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const documentsPage: Page<transaction.OrderDetailDocuments> = await query.page(page, limit);
    return documentsPage;
  }

  async findOne(
    id: string,
    { withDetail, withUploader }: OrderDetailDocumentRelationParams = {}
  ): Promise<transaction.OrderDetailDocuments> {
    let query = transaction.OrderDetailDocuments.query().findById(id);

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withDetail) eagerGraph.detail = { $modify: ["selectDetailInfo"] };
    if (withUploader) eagerGraph.uploader = { $modify: ["selectUploaderInfo"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const document = await query;
    if (!document) {
      throw new NotFoundError(`Order Detail Document with ID ${id} not found`);
    }
    return document;
  }

  async create(
    data: CreateOrderDetailDocumentInput,
    trx?: Transaction
  ): Promise<transaction.OrderDetailDocuments> {
    const detailExists = await transaction.OrderDetails.query(trx).findById(data.order_detail_id);
    if (!detailExists)
      throw new BadRequestError(`Order Detail with ID ${data.order_detail_id} not found.`);

    const uploaderExists = await user.Users.query(trx)
      .findById(data.uploaded_by)
      .whereNull("deleted_at");
    if (!uploaderExists)
      throw new BadRequestError(`Uploader User with ID ${data.uploaded_by} not found.`);

    const documentData = {
      ...data,
    };

    const newDocument = await transaction.OrderDetailDocuments.query(trx)
      .insert(documentData)
      .returning("*");
    return Array.isArray(newDocument) ? newDocument[0] : newDocument;
  }

  async update(
    id: string,
    data: UpdateOrderDetailDocumentInput,
    trx?: Transaction
  ): Promise<transaction.OrderDetailDocuments> {
    const document = await transaction.OrderDetailDocuments.query(trx).findById(id);
    if (!document) {
      throw new NotFoundError(`Order Detail Document with ID ${id} not found`);
    }

    const updatedDocuments = await document.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedDocuments) ? updatedDocuments[0] : updatedDocuments;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await transaction.OrderDetailDocuments.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`Order Detail Document with ID ${id} not found`);
    }
    return { message: `Order Detail Document with ID ${id} deleted successfully` };
  }

  private getEagerModifiers() {
    return {
      selectDetailInfo: (builder: QueryBuilder<transaction.OrderDetails>) => {
        builder.select(
          `${this.T_DETAILS}.id`,
          `${this.T_DETAILS}.name`,
          `${this.T_DETAILS}.service_id`
        );
      },
      selectUploaderInfo: (builder: QueryBuilder<user.Users>) => {
        builder
          .select(`${this.T_USERS}.id`, `${this.T_USERS}.name`, `${this.T_USERS}.email`)
          .whereNull(`${this.T_USERS}.deleted_at`);
      },
    };
  }
}

export default new OrderDetailDocumentsService();
