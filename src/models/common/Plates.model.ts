import { Model } from "objection";
import knex from "../../config/connection";

Model.knex(knex);

class Plates extends Model {
  id!: number;
  name?: string | null;
  icon?: string | null;
  description?: string | null;
  is_active?: boolean;
  deleted_at?: string | null;

  static get tableName() {
    return "common.plates";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("common.plates.deleted_at");
  }

  static async softDelete(id: number): Promise<void> {
    await Plates.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id"],

      properties: {
        id: { type: "integer" },
        name: { type: ["string", "null"], maxLength: 5 },
        icon: { type: ["string", "null"] },
        description: { type: ["string", "null"] },
        is_active: { type: ["boolean", "null"] },
        deleted_at: { type: ["string", "null"] },
      },
    };
  }
}

export default Plates;
