import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type ProvinceRelationParams = {
  withCities?: boolean;
};
type CreateProvinceInput = Pick<common.Provinces, "name"> &
  Partial<Pick<common.Provinces, "description">>;
type UpdateProvinceInput = Partial<CreateProvinceInput>;

interface FindAllProvincesOptions {
  limit: number;
  offset: number;
  search?: string;
  sort?: string;
  withCities?: boolean;
}

export class ProvincesService {
  async findAll({
    limit,
    offset,
    search,
    sort,
    withCities,
  }: FindAllProvincesOptions): Promise<Page<common.Provinces>> {
    let query = common.Provinces.query().whereNull("deleted_at");

    if (search) {
      query = query.where("name", "ilike", `%${search}%`);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "name"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("name", "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    if (withCities) {
      eagerGraph.cities = { $modify: ["selectIdName"] };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<common.Cities>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const provincesPage: Page<common.Provinces> = await query.page(page, limit);
    return provincesPage;
  }

  async findOne(
    id: number,
    { withCities }: ProvinceRelationParams = {}
  ): Promise<common.Provinces> {
    let query = common.Provinces.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    if (withCities) {
      eagerGraph.cities = { $modify: ["selectIdName"] };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<common.Cities>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const province = await query;

    if (!province) {
      throw new NotFoundError(`Province with ID ${id} not found`);
    }
    return province;
  }

  async create(data: CreateProvinceInput, trx?: Transaction): Promise<common.Provinces> {
    const newProvince = await common.Provinces.query(trx).insert(data).returning("*");
    return newProvince;
  }

  async update(
    id: number,
    data: UpdateProvinceInput,
    trx?: Transaction
  ): Promise<common.Provinces> {
    const province = await common.Provinces.query(trx).findById(id).whereNull("deleted_at");
    if (!province) {
      throw new NotFoundError(`Province with ID ${id} not found`);
    }

    const updatedProvinces = await province.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedProvinces) ? updatedProvinces[0] : updatedProvinces;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const province = await common.Provinces.query(trx).findById(id).whereNull("deleted_at");
    if (!province) {
      throw new NotFoundError(`Province with ID ${id} not found`);
    }
    await province.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Province with ID ${id} deleted successfully` };
  }
}

export default new ProvincesService();
