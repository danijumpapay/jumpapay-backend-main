import { Model } from "objection";
import knex from "../../config/connection";
import Users from "../../models/user/Users.model";

Model.knex(knex);

class Companies extends Model {
  id!: string;
  user_id!: string;
  name?: string | null;
  description?: string | null;
  pic?: string | null;
  logo?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  address?: string | null;
  email?: string | null;

  static get tableName() {
    return "company.companies";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        name: { type: ["string", "null"], maxLength: 200 },
        description: { type: ["string", "null"], maxLength: 200 },
        pic: { type: ["string", "null"], maxLength: 150 },
        logo: { type: ["string", "null"] },
        longitude: { type: ["number", "null"] },
        latitude: { type: ["number", "null"] },
        address: { type: ["string", "null"] },
        email: { type: ["string", "null"], maxLength: 200 },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "company.companies.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default Companies;
