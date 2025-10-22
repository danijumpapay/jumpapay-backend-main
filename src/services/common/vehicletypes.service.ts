import { common } from "@jumpapay/jumpapay-models";
import { NotFoundError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type CreateVehicleTypeInput = Pick<common.VehicleTypes, "name"> &
  Partial<Pick<common.VehicleTypes, "is_active">>;
type UpdateVehicleTypeInput = Partial<CreateVehicleTypeInput>;

interface FindAllVehicleTypesOptions {
  limit: number;
  offset: number;
  search?: string;
  is_active?: boolean;
  sort?: string;
}

export class VehicleTypesService {
  async findAll({
    limit,
    offset,
    search,
    is_active,
    sort,
  }: FindAllVehicleTypesOptions): Promise<Page<common.VehicleTypes>> {
    let query = common.VehicleTypes.query().whereNull("deleted_at");

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

    const page = Math.floor(offset / limit);
    const vehicleTypesPage: Page<common.VehicleTypes> = await query.page(page, limit);
    return vehicleTypesPage;
  }

  async findOne(id: number): Promise<common.VehicleTypes> {
    const vehicleType = await common.VehicleTypes.query().findById(id).whereNull("deleted_at");
    if (!vehicleType) {
      throw new NotFoundError(`Vehicle Type with ID ${id} not found`);
    }
    return vehicleType;
  }

  async create(data: CreateVehicleTypeInput, trx?: Transaction): Promise<common.VehicleTypes> {
    const newVehicleType = await common.VehicleTypes.query(trx).insert(data).returning("*");
    return Array.isArray(newVehicleType) ? newVehicleType[0] : newVehicleType;
  }

  async update(
    id: number,
    data: UpdateVehicleTypeInput,
    trx?: Transaction
  ): Promise<common.VehicleTypes> {
    const vehicleType = await common.VehicleTypes.query(trx).findById(id).whereNull("deleted_at");
    if (!vehicleType) {
      throw new NotFoundError(`Vehicle Type with ID ${id} not found`);
    }
    const updatedVehicleTypes = await vehicleType.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedVehicleTypes) ? updatedVehicleTypes[0] : updatedVehicleTypes;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const vehicleType = await common.VehicleTypes.query(trx).findById(id).whereNull("deleted_at");
    if (!vehicleType) {
      throw new NotFoundError(`Vehicle Type with ID ${id} not found`);
    }
    await vehicleType.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Vehicle Type with ID ${id} deleted successfully` };
  }
}

export default new VehicleTypesService();
