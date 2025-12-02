import { customer, user } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type VehicleRelationParams = {
  withOwner?: boolean;
  withType?: boolean;
  withPlate?: boolean;
};

type CreateVehicleInput = Pick<
  customer.Vehicles,
  "user_id" | "vehicle_type_id" | "plate_id" 
> &
  Partial<Pick<
    customer.Vehicles,
    "plate_number" | "plate_serial" | "brand" | "model" | "year_of_manufacture" | "color" | "engine_number" | "chassis_number"
  >>;

type UpdateVehicleInput = Partial<CreateVehicleInput>;

interface FindAllVehiclesOptions {
  limit: number;
  offset: number;
  search?: string; 
  user_id?: string;
  vehicle_type_id?: number;
  sort?: string;
  withOwner?: boolean;
  withType?: boolean;
  withPlate?: boolean;
}


export class VehiclesService {
  async findAll({
    limit,
    offset,
    search,
    user_id,
    vehicle_type_id,
    sort,
    withOwner,
    withType,
    withPlate,
  }: FindAllVehiclesOptions): Promise<Page<customer.Vehicles>> {
    let query = customer.Vehicles.query().whereNull("deleted_at");

    if (search) {
      query = query.where((builder) => {
        builder
          .where("plate_number", "ilike", `%${search}%`)
          .orWhere("brand", "ilike", `%${search}%`)
          .orWhere("model", "ilike", `%${search}%`)
          .orWhere("engine_number", "ilike", `%${search}%`)
          .orWhere("chassis_number", "ilike", `%${search}%`);
      });
    }

    if (user_id) {
      query = query.where("user_id", user_id);
    }
    
    if (vehicle_type_id) {
        query = query.where("vehicle_type_id", vehicle_type_id);
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = ["id", "plate_number", "user_id", "created_at", "year_of_manufactu"];
      if (
        allowedSortColumns.includes(column) &&
        ["asc", "desc"].includes(direction.toLowerCase())
      ) {
        query = query.orderBy(column, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy("created_at", "DESC");
    }

    const eagerGraph: Record<string, any> = {};
    const modifiers = {
      selectIdName: (builder: QueryBuilder<any>) => builder.select("id", "name").whereNull("deleted_at"),
      selectIdNameEmail: (builder: QueryBuilder<any>) => builder.select("id", "name", "email").whereNull("deleted_at"),
    };
    
    if (withOwner) {
      eagerGraph.owner = { $modify: ["selectIdNameEmail"] };
    }
    if (withType) {
      eagerGraph.vehicleType = { $modify: ["selectIdName"] };
    }
    if (withPlate) {
      eagerGraph.plate = { $modify: ["selectIdName"] };
    }

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const vehiclesPage: Page<customer.Vehicles> = await query.page(page, limit);
    return vehiclesPage;
  }
  async findOne(
    id: string,
    { withOwner, withType, withPlate }: VehicleRelationParams = {}
  ): Promise<customer.Vehicles> {
    let query = customer.Vehicles.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    const modifiers = {
      selectIdNameEmail: (builder: QueryBuilder<any>) => builder.select("id", "name", "email").whereNull("deleted_at"),
      selectIdName: (builder: QueryBuilder<any>) => builder.select("id", "name").whereNull("deleted_at"),
    };
    
    if (withOwner) {
      eagerGraph.owner = { $modify: ["selectIdNameEmail"] };
    }
    if (withType) {
      eagerGraph.vehicleType = { $modify: ["selectIdName"] };
    }
    if (withPlate) {
      eagerGraph.plate = { $modify: ["selectIdName"] };
    }


    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const vehicle = await query;

    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async create(data: CreateVehicleInput, trx?: Transaction): Promise<customer.Vehicles> {
    const userExists = await user.Users.query(trx)
      .findById(data.user_id)
      .whereNull("deleted_at");

    if (!userExists) {
      throw new BadRequestError(`User with ID ${data.user_id} does not exist.`);
    }

    if (data.plate_number) {
        const plateExists = await customer.Vehicles.query(trx)
            .where("plate_number", data.plate_number)
            .whereNull("deleted_at")
            .first();
        if (plateExists) {
          return plateExists;
        }
    }

    const newVehicle = await customer.Vehicles.query(trx).insert(data).returning("*");
    return newVehicle;
  }

  async update(id: string, data: UpdateVehicleInput, trx?: Transaction): Promise<customer.Vehicles> {
    const vehicle = await customer.Vehicles.query(trx).findById(id).whereNull("deleted_at");
    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }

    if (data.user_id && data.user_id !== vehicle.user_id) {
      const userExists = await user.Users.query(trx)
        .findById(data.user_id)
        .whereNull("deleted_at");
      if (!userExists) {
        throw new BadRequestError(`User with ID ${data.user_id} does not exist.`);
      }
    }
    
    if (data.plate_number && data.plate_number !== vehicle.plate_number) {
        const plateExists = await customer.Vehicles.query(trx)
            .where("plate_number", data.plate_number)
            .whereNot("id", id) 
            .whereNull("deleted_at")
            .first();
        if (plateExists) {
            throw new BadRequestError(`Vehicle with plate number ${data.plate_number} already exists.`);
        }
    }

    const updatedVehicles = await vehicle.$query(trx).patch(data).returning("*");
    return updatedVehicles[0];
  }

  async remove(id: string, trx?: Transaction): Promise<{ message: string }> {
    const vehicle = await customer.Vehicles.query(trx).findById(id).whereNull("deleted_at");
    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found`);
    }
    await vehicle.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Vehicle with ID ${id} deleted successfully` };
  }
}

export default new VehiclesService();