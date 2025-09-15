import { Model } from "objection";
import knex from "@config/connection";
import Users from "./Users.model";

Model.knex(knex);

type SosialMedia = "INSTAGRAM" | "LINKEDIN" | "FACEBOOK" | "GITHUB";

class UserSosialMedia extends Model {
  id!: string;
  user_id!: string;
  sosial!: SosialMedia;
  link!: string;
  created_at?: string;

  static get tableName() {
    return "user.user_sosial_media";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id", "sosial", "link"],
      properties: {
        id: { type: "string" }, // Tipe data uuid
        user_id: { type: "string", maxLength: 200 },
        sosial: { type: "string", enum: ["INSTAGRAM", "LINKEDIN", "FACEBOOK", "GITHUB"] },
        link: { type: "string" },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "user.user_sosial_media.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default UserSosialMedia;