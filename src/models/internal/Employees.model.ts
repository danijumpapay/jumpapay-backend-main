import { Model } from "objection";
import knex from "@config/connection";
import Users from "@models/user/Users.model";

Model.knex(knex);

type InternalRole = "C LEVEL" | "DEVELOPER" | "CS" | "COURIER";

class Employees extends Model {
  id!: string;
  user_id!: string;
  position?: string | null;
  role?: InternalRole;

  static get tableName() {
    return "internal.employees";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id"],
      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        position: { type: ["string", "null"], maxLength: 150 },
        role: { type: ["string", "null"], enum: ["C LEVEL", "DEVELOPER", "CS", "COURIER"] },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "internal.employees.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default Employees;