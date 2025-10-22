import { service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateOrUpdateFormOrderInput = Omit<service.ServiceFormOrders, "id">;

interface FindAllFormOrdersOptions {
  limit: number;
  offset: number;
  service_id?: number;
  whatsapp_form_id?: string;
  sort?: string;
}

export class ServiceFormOrdersService {
  async findAll({
    limit,
    offset,
    service_id,
    whatsapp_form_id,
    sort,
  }: FindAllFormOrdersOptions): Promise<Page<service.ServiceFormOrders>> {
    let query = service.ServiceFormOrders.query();

    if (service_id) {
      query = query.where("id", service_id);
    }
    if (whatsapp_form_id) {
      query = query.where("whatsapp_form_id", whatsapp_form_id);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "whatsapp_form_id", "whatsapp_form_name"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("id", "ASC");
    }

    const page = Math.floor(offset / limit);
    const formOrdersPage: Page<service.ServiceFormOrders> = await query.page(page, limit);
    return formOrdersPage;
  }

  async findOne(id: number): Promise<service.ServiceFormOrders> {
    const formOrder = await service.ServiceFormOrders.query().findById(id);

    if (!formOrder) {
      throw new NotFoundError(`Service Form Order definition for Service ID ${id} not found`);
    }
    return formOrder;
  }

  async upsert(
    id: number,
    data: CreateOrUpdateFormOrderInput,
    trx?: Transaction
  ): Promise<service.ServiceFormOrders> {
    const serviceExists = await service.Services.query(trx).findById(id).whereNull("deleted_at");
    if (!serviceExists) {
      throw new BadRequestError(`Service with ID ${id} does not exist.`);
    }

    const resultForm = await service.ServiceFormOrders.query(trx)
      .insert({ ...data, id: id })
      .onConflict("id")
      .merge()
      .returning("*")
      .first();

    if (!resultForm) {
      const fetched = await service.ServiceFormOrders.query(trx).findById(id);
      if (!fetched) {
        throw new Error(`Failed to fetch Service Form Order for Service ID ${id} after upsert.`);
      }
      return fetched;
    }

    return resultForm;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await service.ServiceFormOrders.query(trx).deleteById(id);

    if (numDeleted === 0) {
      throw new NotFoundError(`Service Form Order definition for Service ID ${id} not found`);
    }
    return { message: `Service Form Order definition for Service ID ${id} deleted successfully` };
  }
}

export default new ServiceFormOrdersService();
