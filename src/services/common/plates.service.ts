import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError } from "../../utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type PlateRelationParams = {
  withCities?: boolean;
};
type CreatePlateInput = Pick<common.Plates, "name"> &
  Partial<Pick<common.Plates, "icon" | "description" | "is_active">>;
type UpdatePlateInput = Partial<CreatePlateInput>;

interface FindAllPlatesOptions {
  limit: number;
  offset: number;
  search?: string;
  is_active?: boolean;
  sort?: string;
  withCities?: boolean;
}

export class PlatesService {
  async findAll({
    limit,
    offset,
    search,
    is_active,
    sort,
    withCities,
  }: FindAllPlatesOptions): Promise<Page<common.Plates>> {
    let query = common.Plates.query().whereNull("deleted_at");

    if (search) {
      query = query.where("name", "ilike", `%${search}%`);
    }

    if (typeof is_active === "boolean") {
      query = query.where("is_active", is_active);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "name", "is_active"];
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
      eagerGraph.cities = {
        $modify: ["selectIdName", "activeCitiesOnly"],
      };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<common.Cities>) => {
        builder.select(`${common.Cities.tableName}.id`, `${common.Cities.tableName}.name`);
      },
      activeCitiesOnly: (builder: QueryBuilder<common.Cities>) => {
        builder.whereNull(`${common.Cities.tableName}.deleted_at`);
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const platesPage: Page<common.Plates> = await query.page(page, limit);
    return platesPage;
  }

  async findOne(id: number, { withCities }: PlateRelationParams = {}): Promise<common.Plates> {
    let query = common.Plates.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    if (withCities) {
      eagerGraph.cities = {
        $modify: ["selectIdName", "activeCitiesOnly"],
      };
    }

    const modifiers = {
      selectIdName: (builder: QueryBuilder<common.Cities>) => {
        builder.select(`${common.Cities.tableName}.id`, `${common.Cities.tableName}.name`);
      },
      activeCitiesOnly: (builder: QueryBuilder<common.Cities>) => {
        builder.whereNull(`${common.Cities.tableName}.deleted_at`);
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const plate = await query;

    if (!plate) {
      throw new NotFoundError(`Plate with ID ${id} not found`);
    }
    return plate;
  }

  async create(data: CreatePlateInput, trx?: Transaction): Promise<common.Plates> {
    const newPlate = await common.Plates.query(trx).insert(data).returning("*");

    return Array.isArray(newPlate) ? newPlate[0] : newPlate;
  }

  async update(id: number, data: UpdatePlateInput, trx?: Transaction): Promise<common.Plates> {
    const plate = await common.Plates.query(trx).findById(id).whereNull("deleted_at");
    if (!plate) {
      throw new NotFoundError(`Plate with ID ${id} not found`);
    }
    const updatedPlates = await plate.$query(trx).patch(data).returning("*");

    return Array.isArray(updatedPlates) ? updatedPlates[0] : updatedPlates;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const plate = await common.Plates.query(trx).findById(id).whereNull("deleted_at");
    if (!plate) {
      throw new NotFoundError(`Plate with ID ${id} not found`);
    }

    await plate.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Plate with ID ${id} deleted successfully` };
  }
}

export default new PlatesService();
