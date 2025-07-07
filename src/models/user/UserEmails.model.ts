import { Model } from "objection";
import knex from "../../config/connection";

Model.knex(knex);

class UserEmails extends Model {
  id!: string;
  user_id!: string;
  email!: string;
  is_primary?: boolean;
  verified_at?: string | null;

  static get tableName() {
    return "user.user_emails";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "email"],

      properties: {
        id: { type: "string", format: "uuid" },
        user_id: { type: "string", maxLength: 200 },
        email: { type: "string" },
        is_primary: { type: "boolean", default: false },
        verified_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }
}

export default UserEmails;
