import { service } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateOrUpdateFormInput = Pick<service.ServiceHtmlForm, "schema" | "version">;

interface FindAllFormsOptions {
  limit: number;
  offset: number;
  service_id?: number;
  version?: number;
  sort?: string;
}

export class ServiceHtmlFormService {
  async findAll({
    limit,
    offset,
    service_id,
    version,
    sort,
  }: FindAllFormsOptions): Promise<Page<service.ServiceHtmlForm>> {
    let query = service.ServiceHtmlForm.query();

    if (service_id) {
      query = query.where("id", service_id);
    }
    if (version) {
      query = query.where("version", version);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "version"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("id", "ASC").orderBy("version", "DESC");
    }

    const page = Math.floor(offset / limit);
    const formsPage: Page<service.ServiceHtmlForm> = await query.page(page, limit);
    return formsPage;
  }

  async findOne(id: number): Promise<service.ServiceHtmlForm> {
    const form = await service.ServiceHtmlForm.query()
      .where("id", id)
      .orderBy("version", "DESC")
      .first();

    if (!form) {
      throw new NotFoundError(`HTML Form Schema for Service ID ${id} not found`);
    }
    return form;
  }

  async upsert(
    id: number,
    data: CreateOrUpdateFormInput,
    trx?: Transaction
  ): Promise<service.ServiceHtmlForm> {
    const serviceExists = await service.Services.query(trx).findById(id).whereNull("deleted_at");
    if (!serviceExists) {
      throw new BadRequestError(`Service with ID ${id} does not exist.`);
    }

    const existingForm = await service.ServiceHtmlForm.query(trx)
      .where({ id: id, version: data.version })
      .first();

    let resultForm: service.ServiceHtmlForm;

    if (existingForm) {
      const updated = await existingForm.$query(trx).patch(data).returning("*");
      resultForm = Array.isArray(updated) ? updated[0] : updated;
    } else {
      const insertData = { ...data, id: id };
      const inserted = await service.ServiceHtmlForm.query(trx).insert(insertData).returning("*");
      resultForm = Array.isArray(inserted) ? inserted[0] : inserted;
    }

    return resultForm;
  }

  async remove(id: number, version: number, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await service.ServiceHtmlForm.query(trx)
      .delete()
      .where({ id: id, version: version });

    if (numDeleted === 0) {
      throw new NotFoundError(`HTML Form Schema version ${version} for Service ID ${id} not found`);
    }
    return {
      message: `HTML Form Schema version ${version} for Service ID ${id} deleted successfully`,
    };
  }

  async removeAllForService(id: number, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await service.ServiceHtmlForm.query(trx).delete().where({ id: id });

    if (numDeleted === 0) {
      throw new NotFoundError(`No HTML Form Schemas found for Service ID ${id}`);
    }
    return { message: `All HTML Form Schemas for Service ID ${id} deleted successfully` };
  }
}

export default new ServiceHtmlFormService();
