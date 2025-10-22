import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CityRelationParams = {
  withProvince?: boolean;
  withCityPlates?: boolean;
};

type CreateCityInput = Pick<common.Cities, "province_id" | "name"> &
  Partial<Pick<common.Cities, "icon">>;
type UpdateCityInput = Partial<CreateCityInput>;

interface FindAllCitiesOptions {
  limit: number;
  offset: number;
  search?: string;
  province_id?: number;
  sort?: string;
  withProvince?: boolean;
  withCityPlates?: boolean;
}

export class CitiesService {
  async findAll({
    limit,
    offset,
    search,
    province_id,
    sort,
    withProvince,
    withCityPlates,
  }: FindAllCitiesOptions): Promise<Page<common.Cities>> {
    let query = common.Cities.query().whereNull("deleted_at");

    if (search) {
      query = query.where("name", "ilike", `%${search}%`);
    }

    if (province_id) {
      query = query.where("province_id", province_id);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "name", "province_id"];
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
    if (withProvince) {
      eagerGraph.province = true;
    }
    if (withCityPlates) {
      eagerGraph.cityPlates = {
        plate: {
          $modify: ["selectIdName"],
        },
      };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<any>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const citiesPage: Page<common.Cities> = await query.page(page, limit);
    return citiesPage;
  }

  async findOne(
    id: number,
    { withProvince, withCityPlates }: CityRelationParams = {}
  ): Promise<common.Cities> {
    let query = common.Cities.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    if (withProvince) {
      eagerGraph.province = true;
    }
    if (withCityPlates) {
      eagerGraph.cityPlates = {
        plate: {
          $modify: ["selectIdName"],
        },
      };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<any>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const city = await query;

    if (!city) {
      throw new NotFoundError(`City with ID ${id} not found`);
    }
    return city;
  }

  async create(data: CreateCityInput, trx?: Transaction): Promise<common.Cities> {
    const provinceExists = await common.Provinces.query(trx)
      .findById(data.province_id)
      .whereNull("deleted_at");
    if (!provinceExists) {
      throw new BadRequestError(`Province with ID ${data.province_id} does not exist.`);
    }

    const newCity = await common.Cities.query(trx).insert(data).returning("*");
    return newCity;
  }

  async update(id: number, data: UpdateCityInput, trx?: Transaction): Promise<common.Cities> {
    const city = await common.Cities.query(trx).findById(id).whereNull("deleted_at");
    if (!city) {
      throw new NotFoundError(`City with ID ${id} not found`);
    }

    if (data.province_id && data.province_id !== city.province_id) {
      const provinceExists = await common.Provinces.query(trx)
        .findById(data.province_id)
        .whereNull("deleted_at");
      if (!provinceExists) {
        throw new BadRequestError(`Province with ID ${data.province_id} does not exist.`);
      }
    }

    const updatedCities = await city.$query(trx).patch(data).returning("*");
    return updatedCities[0];
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const city = await common.Cities.query(trx).findById(id).whereNull("deleted_at");
    if (!city) {
      throw new NotFoundError(`City with ID ${id} not found`);
    }
    await city.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `City with ID ${id} deleted successfully` };
  }
}

export default new CitiesService();
