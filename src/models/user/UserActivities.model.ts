import { Model } from "objection";
import knex from "../../config/connection";

Model.knex(knex);

class UsersActivites extends Model {
  id!: string;
  user_id?: string;
  activity_name?: string | null;
  activity_detail?: string | null;
  created_at?: Date;

  static get tableName() {
    return "user.user_activities";
  }
    
  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "activity_name"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        activity_name: { type: ["string", "null"], maxLength: 150 },
        activity_detail: { type: ["string", "null"] },
        created_at: { type: "string" },
      },
    };
  }
}

export default UsersActivites;
