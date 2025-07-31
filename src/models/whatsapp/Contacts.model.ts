import { Model } from "objection";
import knex from "@config/connection";

Model.knex(knex);

class Contacts extends Model {
  id!: string;
  whatsapp_id!: string;
  phone!: string;
  name!: string;
  created_at?: Date;

  static get tableName() {
    return "whatsapp.contacts";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "whatsapp_id", "phone", "name"],

      properties: {
        id: { type: "string", maxLength: 200 },
        whatsapp_id: { type: "string", maxLength: 200 },
        phone: { type: "string", maxLength: 50 },
        name: { type: "string", maxLength: 200 },
        created_at: { type: "string" },
      },
    };
  }
}

export default Contacts;
