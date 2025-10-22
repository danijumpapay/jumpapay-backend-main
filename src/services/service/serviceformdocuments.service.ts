import { service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateOrUpdateFormDocumentInput = Omit<service.ServiceFormDocuments, "id">;

interface FindAllFormDocumentsOptions {
  limit: number;
  offset: number;
  service_id?: number;
  whatsapp_form_id?: string;
  sort?: string;
}

export class ServiceFormDocumentsService {
  async findAll({
    limit,
    offset,
    service_id,
    whatsapp_form_id,
    sort,
  }: FindAllFormDocumentsOptions): Promise<Page<service.ServiceFormDocuments>> {
    let query = service.ServiceFormDocuments.query();

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
    const formDocumentsPage: Page<service.ServiceFormDocuments> = await query.page(page, limit);
    return formDocumentsPage;
  }

  async findOne(id: number): Promise<service.ServiceFormDocuments> {
    const formDocument = await service.ServiceFormDocuments.query().findById(id);

    if (!formDocument) {
      throw new NotFoundError(`Service Form Document definition for Service ID ${id} not found`);
    }
    return formDocument;
  }

  async upsert(
    id: number,
    data: CreateOrUpdateFormDocumentInput,
    trx?: Transaction
  ): Promise<service.ServiceFormDocuments> {
    const serviceExists = await service.Services.query(trx).findById(id).whereNull("deleted_at");
    if (!serviceExists) {
      throw new BadRequestError(`Service with ID ${id} does not exist.`);
    }

    const resultForm = await service.ServiceFormDocuments.query(trx)
      .insert({ ...data, id: id })
      .onConflict("id")
      .merge()
      .returning("*")
      .first();

    if (!resultForm) {
      const fetched = await service.ServiceFormDocuments.query(trx).findById(id);
      if (!fetched) {
        throw new Error(`Failed to fetch Service Form Document for Service ID ${id} after upsert.`);
      }
      return fetched;
    }

    return resultForm;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await service.ServiceFormDocuments.query(trx).deleteById(id);

    if (numDeleted === 0) {
      throw new NotFoundError(`Service Form Document definition for Service ID ${id} not found`);
    }
    return {
      message: `Service Form Document definition for Service ID ${id} deleted successfully`,
    };
  }
}

export default new ServiceFormDocumentsService();
