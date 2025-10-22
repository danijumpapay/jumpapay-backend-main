import { transaction, service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateOrderFormDataInput = Pick<
  transaction.OrderFormDatas,
  "order_detail_id" | "form_token" | "form_data"
>;
type UpdateOrderFormDataInput = Partial<
  Pick<transaction.OrderFormDatas, "form_token" | "form_data">
>;
type OrderFormDataRelationParams = {
  withDetail?: boolean;
};

interface FindAllOrderFormDatasOptions extends OrderFormDataRelationParams {
  limit: number;
  offset: number;
  order_detail_id?: string;
  form_token?: string;
  sort?: string;
}

export class OrderFormDatasService {
  private T_FORMDATA = transaction.OrderFormDatas.tableName;
  private T_DETAILS = transaction.OrderDetails.tableName;
  private T_SERVICES = service.Services.tableName;

  async findAll({
    limit,
    offset,
    order_detail_id,
    form_token,
    sort,
    withDetail,
  }: FindAllOrderFormDatasOptions): Promise<Page<transaction.OrderFormDatas>> {
    let query = transaction.OrderFormDatas.query();

    if (order_detail_id) query = query.where(`${this.T_FORMDATA}.order_detail_id`, order_detail_id);
    if (form_token) query = query.where(`${this.T_FORMDATA}.form_token`, form_token);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "order_detail_id", "form_token", "created_at"];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${this.T_FORMDATA}.${column}`
        : `${this.T_FORMDATA}.created_at`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${this.T_FORMDATA}.created_at`, "DESC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withDetail) eagerGraph.detail = { $modify: ["selectDetailInfo"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const formDataPage: Page<transaction.OrderFormDatas> = await query.page(page, limit);
    return formDataPage;
  }

  async findOne(
    id: string,
    { withDetail }: OrderFormDataRelationParams = {}
  ): Promise<transaction.OrderFormDatas> {
    let query = transaction.OrderFormDatas.query().findById(id);

    const eagerGraph: Record<string, any> = {};
    const modifiers = this.getEagerModifiers();
    if (withDetail) eagerGraph.detail = { $modify: ["selectDetailInfo"] };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const formData = await query;
    if (!formData) {
      throw new NotFoundError(`Order Form Data with ID ${id} not found`);
    }
    return formData;
  }

  async create(
    data: CreateOrderFormDataInput,
    trx?: Transaction
  ): Promise<transaction.OrderFormDatas> {
    const detailExists = await transaction.OrderDetails.query(trx).findById(data.order_detail_id);
    if (!detailExists)
      throw new BadRequestError(`Order Detail with ID ${data.order_detail_id} not found.`);

    const existingData = await transaction.OrderFormDatas.query(trx).findOne({
      order_detail_id: data.order_detail_id,
      form_token: data.form_token,
    });
    if (existingData) {
      throw new BadRequestError(
        `Form data with token ${data.form_token} already exists for this order detail.`
      );
    }

    const formData = {
      ...data,
    };

    const newFormData = await transaction.OrderFormDatas.query(trx).insert(formData).returning("*");
    return Array.isArray(newFormData) ? newFormData[0] : newFormData;
  }

  async update(
    id: string,
    data: UpdateOrderFormDataInput,
    trx?: Transaction
  ): Promise<transaction.OrderFormDatas> {
    const formData = await transaction.OrderFormDatas.query(trx).findById(id);
    if (!formData) {
      throw new NotFoundError(`Order Form Data with ID ${id} not found`);
    }

    if (data.form_token && data.form_token !== formData.form_token) {
      const existingData = await transaction.OrderFormDatas.query(trx)
        .findOne({
          order_detail_id: formData.order_detail_id,
          form_token: data.form_token,
        })
        .whereNot("id", id);
      if (existingData) {
        throw new BadRequestError(
          `Form data with token ${data.form_token} already exists for this order detail.`
        );
      }
    }

    const updatedFormData = await formData.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedFormData) ? updatedFormData[0] : updatedFormData;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await transaction.OrderFormDatas.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`Order Form Data with ID ${id} not found`);
    }
    return { message: `Order Form Data with ID ${id} deleted successfully` };
  }

  private getEagerModifiers() {
    return {
      selectDetailInfo: (builder: QueryBuilder<transaction.OrderDetails>) => {
        builder
          .select(`${this.T_DETAILS}.id`, `${this.T_DETAILS}.name`, `${this.T_DETAILS}.service_id`)
          .withGraphFetched("service(selectServiceName)")
          .modifiers({
            selectServiceName: (svcBuilder: QueryBuilder<service.Services>) => {
              svcBuilder
                .select(`${this.T_SERVICES}.id`, `${this.T_SERVICES}.name`)
                .whereNull(`${this.T_SERVICES}.deleted_at`);
            },
          });
      },
    };
  }
}

export default new OrderFormDatasService();
