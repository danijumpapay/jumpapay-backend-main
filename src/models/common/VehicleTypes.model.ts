import { Model } from "objection";
import knex from "../../config/connection";

Model.knex(knex);

class VehicleTypes extends Model {
  id!: number;
  name!: string;
  deleted_at?: string | null;

  static get tableName() {
    return "common.vehicle_types";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("common.vehicle_types.deleted_at");
  }

  static async softDelete(id: number): Promise<void> {
    await VehicleTypes.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name"],

      properties: {
        id: { type: "integer" },
        name: { type: "string", maxLength: 100 },
        deleted_at: { type: ["string", "null"] },
      },
    };
  }
}

export default VehicleTypes;
