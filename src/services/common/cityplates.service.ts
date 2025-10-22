import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateCityPlateInput = Pick<common.CityPlates, "city_id" | "plate_id"> &
  Partial<Pick<common.CityPlates, "is_active">>;
type UpdateCityPlateInput = Pick<common.CityPlates, "is_active">;

interface FindAllCityPlatesOptions {
  limit: number;
  offset: number;
  city_id?: number;
  plate_id?: number;
  is_active?: boolean;
  sort?: string;
}

export class CityPlatesService {
  async findAll({
    limit,
    offset,
    city_id,
    plate_id,
    is_active,
    sort,
  }: FindAllCityPlatesOptions): Promise<Page<common.CityPlates>> {
    let query = common.CityPlates.query();

    if (city_id) {
      query = query.where("city_id", city_id);
    }
    if (plate_id) {
      query = query.where("plate_id", plate_id);
    }
    if (typeof is_active === "boolean") {
      query = query.where("is_active", is_active);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "city_id", "plate_id", "is_active"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("id", "ASC");
    }

    query = query.withGraphFetched("[city(selectIdName), plate(selectIdNamePlate)]");

    const modifiers = {
      selectIdName: (builder: QueryBuilder<common.Cities>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
      selectIdNamePlate: (builder: QueryBuilder<common.Plates>) => {
        builder.select("id", "name").whereNull("deleted_at");
      },
    };
    query = query.modifiers(modifiers);

    const page = Math.floor(offset / limit);
    const cityPlatesPage: Page<common.CityPlates> = await query.page(page, limit);
    return cityPlatesPage;
  }

  async findOne(id: string): Promise<common.CityPlates> {
    const cityPlate = await common.CityPlates.query()
      .findById(id)
      .withGraphFetched("[city(selectIdName), plate(selectIdNamePlate)]")
      .modifiers({
        selectIdName: (builder: QueryBuilder<common.Cities>) => {
          builder.select("id", "name").whereNull("deleted_at");
        },
        selectIdNamePlate: (builder: QueryBuilder<common.Plates>) => {
          builder.select("id", "name").whereNull("deleted_at");
        },
      });
    if (!cityPlate) {
      throw new NotFoundError(`CityPlate relation with ID ${id} not found`);
    }
    return cityPlate;
  }

  async create(data: CreateCityPlateInput, trx?: Transaction): Promise<common.CityPlates> {
    const cityExists = await common.Cities.query(trx)
      .findById(data.city_id)
      .whereNull("deleted_at");
    if (!cityExists) throw new BadRequestError(`City with ID ${data.city_id} not found.`);
    const plateExists = await common.Plates.query(trx)
      .findById(data.plate_id)
      .whereNull("deleted_at");
    if (!plateExists) throw new BadRequestError(`Plate with ID ${data.plate_id} not found.`);

    const existingRelation = await common.CityPlates.query(trx).findOne({
      city_id: data.city_id,
      plate_id: data.plate_id,
    });
    if (existingRelation) {
      throw new BadRequestError(
        `Relation between City ID ${data.city_id} and Plate ID ${data.plate_id} already exists.`
      );
    }

    const newRelation = await common.CityPlates.query(trx).insert(data).returning("*");
    return Array.isArray(newRelation) ? newRelation[0] : newRelation;
  }

  async update(
    id: string,
    data: UpdateCityPlateInput,
    trx?: Transaction
  ): Promise<common.CityPlates> {
    const relation = await common.CityPlates.query(trx).findById(id);
    if (!relation) {
      throw new NotFoundError(`CityPlate relation with ID ${id} not found`);
    }
    const updatedRelations = await relation.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedRelations) ? updatedRelations[0] : updatedRelations;
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const numDeleted = await common.CityPlates.query(trx).deleteById(id);
    if (numDeleted === 0) {
      throw new NotFoundError(`CityPlate relation with ID ${id} not found`);
    }
    return { message: `CityPlate relation with ID ${id} deleted successfully` };
  }
}

export default new CityPlatesService();
