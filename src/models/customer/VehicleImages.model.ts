import { Model } from "objection";
import knex from "../../config/connection";
import Vehicles from "../../models/customer/Vehicles.model";

Model.knex(knex);

class VehicleImages extends Model {
  id!: string;
  vehicle_id!: string;
  original_image?: string | null;
  image?: string | null;
  created_at?: string | null;

  static get tableName() {
    return "customer.vehicle_images";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["vehicle_id"],

      properties: {
        id: { type: "string", format: "uuid" },
        vehicle_id: { type: "string", maxLength: 200 },
        original_image: { type: ["string", "null"] },
        image: { type: ["string", "null"] },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    vehicle: {
      relation: Model.BelongsToOneRelation,
      modelClass: Vehicles,
      join: {
        from: "customer.vehicle_images.vehicle_id",
        to: "customer.vehicles.id",
      },
    },
  };
}

export default VehicleImages;
