import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateSamsatInput = Pick<common.Samsat, "name"> &
  Partial<Pick<common.Samsat, "description" | "longitude" | "latitude">>;
type UpdateSamsatInput = Partial<CreateSamsatInput>;

interface FindAllSamsatOptions {
  limit: number;
  offset: number;
  search?: string;
  sort?: string;
}

export class SamsatService {
  async findAll({
    limit,
    offset,
    search,
    sort,
  }: FindAllSamsatOptions): Promise<Page<common.Samsat>> {
    let query = common.Samsat.query().whereNull("deleted_at");

    if (search) {
      query = query.where("name", "ilike", `%${search}%`);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "name", "created_at"];
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
    const samsatPage: Page<common.Samsat> = await query.page(page, limit);
    return samsatPage;
  }

  async findOne(id: number): Promise<common.Samsat> {
    const samsat = await common.Samsat.query().findById(id).whereNull("deleted_at");
    if (!samsat) {
      throw new NotFoundError(`Samsat with ID ${id} not found`);
    }
    return samsat;
  }

  async create(data: CreateSamsatInput, trx?: Transaction): Promise<common.Samsat> {
    const existing = await common.Samsat.query(trx)
      .findOne({ name: data.name })
      .whereNull("deleted_at");
    if (existing) {
      throw new BadRequestError(`Samsat with name "${data.name}" already exists.`);
    }
    const newSamsat = await common.Samsat.query(trx).insert(data).returning("*");
    return Array.isArray(newSamsat) ? newSamsat[0] : newSamsat;
  }

  async update(id: number, data: UpdateSamsatInput, trx?: Transaction): Promise<common.Samsat> {
    const samsat = await common.Samsat.query(trx).findById(id).whereNull("deleted_at");
    if (!samsat) {
      throw new NotFoundError(`Samsat with ID ${id} not found`);
    }

    if (data.name && data.name !== samsat.name) {
      const existing = await common.Samsat.query(trx)
        .findOne({ name: data.name })
        .whereNull("deleted_at")
        .whereNot("id", id);
      if (existing) {
        throw new BadRequestError(`Samsat with name "${data.name}" already exists.`);
      }
    }
    const updatedSamsat = await samsat.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedSamsat) ? updatedSamsat[0] : updatedSamsat;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const samsat = await common.Samsat.query(trx).findById(id).whereNull("deleted_at");
    if (!samsat) {
      throw new NotFoundError(`Samsat with ID ${id} not found`);
    }
    await samsat.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Samsat with ID ${id} deleted successfully` };
  }
}

export default new SamsatService();
