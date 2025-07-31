import { Model } from "objection";
import knex from "../../config/connection";
import Users from "../../models/user/Users.model";

Model.knex(knex);

class UserOtp extends Model {
  id!: string;
  user_id!: string;
  name?: string | null;
  code?: string | null;
  expired_at?: string | null;
  created_at?: Date;

  static get tableName() {
    return "user.user_otp";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id"], 

      properties: {
        id: { type: "string", format: "uuid" },
        user_id: { type: "string", maxLength: 200 },
        name: { type: ["string", "null"], maxLength: 100 },
        code: { type: ["string", "null"] },
        expired_at: { type: ["string", "null"] },
        created_at: { type: "string" },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "user.user_otp.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default UserOtp;
