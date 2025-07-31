import { Model } from "objection";
import knex from "@config/connection";

Model.knex(knex);

class Roles extends Model {
  id!: number;
  name!: string;

  static get tableName() {
    return "whatsapp.roles";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name"],

      properties: {
        id: { type: "number" },
        name: { type: "string", maxLength: 200 },
      },
    };
  }
}

export default Roles;
