import { Model } from "objection";
import knex from "@config/connection";
import Users from "@models/user/Users.model";
import Companies from "./Companies.model";

Model.knex(knex);

type EmployeeRole = "ADMIN" | "CS" | "SUPERVISOR";

class CompanyEmployees extends Model {
  id!: string;
  user_id!: string;
  company_id!: string;
  role?: EmployeeRole;

  static get tableName() {
    return "company.company_employees";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id", "company_id"],
      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        company_id: { type: "string", maxLength: 200 },
        role: { type: ["string", "null"], enum: ["ADMIN", "CS", "SUPERVISOR"] },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "company.company_employees.user_id",
        to: "user.users.id",
      },
    },
    company: {
      relation: Model.BelongsToOneRelation,
      modelClass: Companies,
      join: {
        from: "company.company_employees.company_id",
        to: "company.companies.id",
      },
    },
  };
}

export default CompanyEmployees;