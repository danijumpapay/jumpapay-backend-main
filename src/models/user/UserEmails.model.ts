import { Model } from "objection";
import knex from "@config/connection";
import Users from "./Users.model";

Model.knex(knex);

class UserEmails extends Model {
  id!: string;
  user_id!: string;
  email!: string;
  is_primary?: boolean | null;
  verified_at?: string | null;

  static get tableName() {
    return "user.user_emails";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id", "email"],
      properties: {
        id: { type: "string" }, // Tipe data uuid
        user_id: { type: "string", maxLength: 200 },
        email: { type: "string" },
        is_primary: { type: ["boolean", "null"] },
        verified_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "user.user_emails.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default UserEmails;