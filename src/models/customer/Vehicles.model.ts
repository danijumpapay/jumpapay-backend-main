import { Model } from "objection";
import knex from "../../config/connection";
import Users from "../../models/user/Users.model";
import VehicleTypes from "../../models/common/VehicleTypes.model";
import Plates from "../../models/common/Plates.model";

Model.knex(knex);

class Vehicles extends Model {
  id!: string;
  user_id!: string;
  vehicle_type_id!: number;
  plate_id!: number;
  plate_number?: string | null;
  plate_serial?: string | null;
  brand?: string | null;
  model?: string | null;
  year_of_manufacture?: number | null;
  color?: string | null;
  engine_number?: string | null;
  chassis_number?: string | null;
  deleted_at?: string | null;
  created_at?: string | null;

  static get tableName() {
    return "customer.vehicles";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("customer.vehicles.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await Vehicles.query()
      .findById(id)
      .patch({ deleted_at: new Date().toISOString() });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id", "vehicle_type_id", "plate_id"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        vehicle_type_id: { type: "integer" },
        plate_id: { type: "integer" },
        plate_number: { type: ["string", "null"], maxLength: 10 },
        plate_serial: { type: ["string", "null"], maxLength: 10 },
        brand: { type: ["string", "null"], maxLength: 200 },
        model: { type: ["string", "null"], maxLength: 200 },
        year_of_manufacture: { type: ["integer", "null"] },
        color: { type: ["string", "null"], maxLength: 100 },
        engine_number: { type: ["string", "null"], maxLength: 200 },
        chassis_number: { type: ["string", "null"], maxLength: 200 },
        deleted_at: { type: ["string", "null"], format: "date-time" },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "customer.vehicles.user_id",
        to: "user.users.id",
      },
    },
    vehicleType: {
      relation: Model.BelongsToOneRelation,
      modelClass: VehicleTypes,
      join: {
        from: "customer.vehicles.vehicle_type_id",
        to: "common.vehicle_types.id",
      },
    },
    plate: {
      relation: Model.BelongsToOneRelation,
      modelClass: Plates,
      join: {
        from: "customer.vehicles.plate_id",
        to: "common.plates.id",
      },
    },
  };
}

export default Vehicles;
