import { Model } from "objection";
import knex from "../../config/connection";
import Cities from "./Cities.model";
import Plates from "./Plates.model";

Model.knex(knex);

class CityPlates extends Model {
  id!: string;
  city_id!: number;
  plate_id!: number;
  is_active?: boolean;

  static get tableName() {
    return "common.city_plates";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["city_id", "plate_id"],

      properties: {
        id: { type: "string", format: "uuid" },
        city_id: { type: "integer" },
        plate_id: { type: "integer" },
        is_active: { type: "boolean", default: true },
      },
    };
  }

  static relationMappings = {
    city: {
      relation: Model.BelongsToOneRelation,
      modelClass: Cities,
      join: {
        from: "common.city_plates.city_id",
        to: "common.cities.id",
      },
    },
    plate: {
      relation: Model.BelongsToOneRelation,
      modelClass: Plates,
      join: {
        from: "common.city_plates.plate_id",
        to: "common.plates.id",
      },
    },
  };
}

export default CityPlates;
