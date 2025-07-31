import { Model } from "objection";
import knex from "@config/connection";

Model.knex(knex);

class Access extends Model {
  id!: number;
  group_id!: string;
  whatsapp_id!: string;
  user_id!: string;
  created_at?: string;

  static get tableName() {
    return "whatsapp.accesss";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "id",
        "group_id",
        "whatsapp_id",
        "user_id",
      ],

      properties: {
        id: { type: "string", maxLength: 200 },
        group_id: { type: "number", maxLength: 11 },
        whatsapp_id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        created_at: { type: "string" },
      },
    };
  }
}

export default Access;
