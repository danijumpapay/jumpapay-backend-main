import { Model } from "objection";
import knex from "../../config/connection";

Model.knex(knex);

class UserSosialMedia extends Model {
  id!: string;
  user_id!: string;
  sosial!: "INSTAGRAM" | "LINKEDIN" | "FACEBOOK" | "GITHUB";
  link!: string;
  created_at?: Date;
  

  static get tableName() {
    return "user.user_sosial_media";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "sosial", "link"],

      properties: {
        id: { type: "string", format: "uuid" },
        user_id: { type: "string", maxLength: 200 },
        sosial: {
          type: "string",
          enum: ["INSTAGRAM", "LINKEDIN", "FACEBOOK", "GITHUB"],
        },
        link: { type: "string" },
        created_at: { type: "string" },
      },
    };
  }
}

export default UserSosialMedia;
