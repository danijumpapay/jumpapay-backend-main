import { Model } from "objection";
import knex from "@config/connection";
import Users from "./Users.model";

Model.knex(knex);

class UserTokens extends Model {
  id!: string;
  user_id!: string;
  name?: string | null;
  device?: string | null;
  browser?: string | null;
  ip?: string | null;
  location?: string | null;
  token?: string | null;
  expired_at?: string | null;
  is_expired?: boolean | null;
  created_at?: string;

  static get tableName() {
    return "user.user_tokens";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id"],
      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        name: { type: ["string", "null"], maxLength: 100 },
        device: { type: ["string", "null"], maxLength: 150 },
        browser: { type: ["string", "null"], maxLength: 100 },
        ip: { type: ["string", "null"], maxLength: 100 },
        location: { type: ["string", "null"], maxLength: 150 },
        token: { type: ["string", "null"] },
        expired_at: { type: ["string", "null"], format: "date-time" },
        is_expired: { type: ["boolean", "null"] },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "user.user_tokens.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default UserTokens;