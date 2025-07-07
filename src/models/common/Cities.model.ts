import { Model } from "objection";
import knex from "../../config/connection";

Model.knex(knex);

class Cities extends Model {
  id!: number;
  name?: string;
  icon?: string | null;
  deleted_at?: string | null;

  static get tableName() {
    return "common.cities";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("common.cities.deleted_at");
  }

  static async softDelete(id: number): Promise<void> {
    await Cities.query()
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
        name: { type: ["string", "null"], maxLength: 200 },
        icon: { type: ["string", "null"] },
        deleted_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }
}

export default Cities;
