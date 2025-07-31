import { Model } from "objection";
import knex from "@config/connection";

Model.knex(knex);

class LastMessage extends Model {
  id!: string;
  phone!: string;
  message?: string | null;
  updated_at?: string | null;
  created_at?: string;

  static get tableName() {
    return "history.last_message";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["phone"],

      properties: {
        id: { type: "string" },
        phone: { type: "string", maxLength: 30 },
        message: { type: ["string", "null"] },
        updated_at: { type: ["string", "null"] },
        created_at: { type: "string" },
      },
    };
  }
}

export default LastMessage;
