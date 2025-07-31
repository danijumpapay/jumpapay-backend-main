import { Model } from "objection";
import knex from "@config/connection";

Model.knex(knex);

class AccessRoles extends Model {
  id!: number;
  group_id!: string;
  whatsapp_id!: string;
  user_id!: string;
  created_at?: string;

  static get tableName() {
    return "whatsapp.accesss_role";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "id",
        "access_id",
        "role_id",
        "created_at",
      ],

      properties: {
        id: { type: "string", format: "uuid" },
        access_id: { type: "string", maxLength: 200 },
        role_id: { type: "number", maxLength: 11 },
        created_at: { type: "string" },
      },
    };
  }
}

export default AccessRoles;
