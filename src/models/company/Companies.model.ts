import { Model } from "objection";
import knex from "@config/connection";
import Users from "@models/user/Users.model";
import CompanyEmployees from "./CompanyEmployees.model";
import CompanyWhatsapp from "./CompanyWhatsapp.model";

Model.knex(knex);

type CompanyType = "PARTNER" | "VENDOR" | "INTERNAL";

class Companies extends Model {
  id!: string;
  user_id!: string;
  company_code!: string;
  name?: string | null;
  description?: string | null;
  pic?: string | null;
  logo?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  address?: string | null;
  type?: CompanyType | null;
  email?: string | null;

  static get tableName() {
    return "company.companies";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id", "company_code", "name"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        company_code: { type: "string", maxLength: 200 },
        name: { type: ["string", "null"], maxLength: 200 },
        description: { type: ["string", "null"], maxLength: 200 },
        pic: { type: ["string", "null"], maxLength: 150 },
        logo: { type: ["string", "null"] },
        longitude: { type: ["number", "null"] },
        latitude: { type: ["number", "null"] },
        address: { type: ["string", "null"] },
        type: { type: ["string", "null"], enum: ["PARTNER", "VENDOR", "INTERNAL"] },
        email: { type: ["string", "null"], maxLength: 200 },
      },
    };
  }

  static relationMappings = {
    owner: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "company.companies.user_id",
        to: "user.users.id",
      },
    },

    companyEmployees: {
      relation: Model.HasManyRelation,
      modelClass: CompanyEmployees,
      join: {
        from: "company.companies.id",
        to: "company.company_employees.company_id",
      },
    },
    
    employees: {
      relation: Model.ManyToManyRelation,
      modelClass: Users,
      join: {
        from: "company.companies.id",
        through: {
          from: "company.company_employees.company_id",
          to: "company.company_employees.user_id"
        },
        to: "user.users.id"
      }
    },

    whatsappAccounts: {
      relation: Model.HasManyRelation,
      modelClass: CompanyWhatsapp,
      join: {
        from: "company.companies.id",
        to: "company.company_whatsapp.company_id"
      }
    }
  };
}

export default Companies;