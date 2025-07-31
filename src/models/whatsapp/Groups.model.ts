import { Model } from "objection";
import knex from "@config/connection";

Model.knex(knex);

class Groups extends Model {
  id!: number;
  name!: string;
  icon?: string | null;
  description?: string | null;
  created_by?: string | null;
  deleted_at?: string | null;
  created_at?: Date;

  static get tableName() {
    return "whatsapp.groups";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name"],

      properties: {
        id: { type: "number" },
        name: { type: "string", maxLength: 150 },
        icon: { type: "string" },
        description: { type: "string" },
        created_by: { type: "string", maxLength: 200 },
        deleted_at: { type: ["string", "null"] },
        created_at: { type: "string" },
      },
    };
  }
}

export default Groups;
