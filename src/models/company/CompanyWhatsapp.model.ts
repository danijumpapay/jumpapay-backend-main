import { Model } from "objection";
import knex from "@config/connection";
import Companies from "./Companies.model";

Model.knex(knex);

class CompanyWhatsapp extends Model {
  id!: string;
  company_id!: string;
  phone_id?: string | null;
  wab_id?: string | null;
  phone?: string | null;
  name?: string | null;
  avatar?: string | null;
  address?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  access_token?: string | null;
  webhook?: string | null;
  webhook_token?: string | null;
  is_active?: boolean | null;
  deleted_at?: string | null;
  created_at?: string;

  static get tableName() {
    return "company.company_whatsapp";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("company.company_whatsapp.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await CompanyWhatsapp.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "company_id"],
      properties: {
        id: { type: "string", maxLength: 200 },
        company_id: { type: "string", maxLength: 200 },
        phone_id: { type: ["string", "null"], maxLength: 200 },
        wab_id: { type: ["string", "null"], maxLength: 200 },
        phone: { type: ["string", "null"], maxLength: 50 },
        name: { type: ["string", "null"], maxLength: 50 },
        avatar: { type: ["string", "null"] },
        address: { type: ["string", "null"], maxLength: 250 },
        email: { type: ["string", "null"], maxLength: 250 },
        website: { type: ["string", "null"], maxLength: 250 },
        description: { type: ["string", "null"] },
        access_token: { type: ["string", "null"] },
        webhook: { type: ["string", "null"] },
        webhook_token: { type: ["string", "null"] },
        is_active: { type: ["boolean", "null"] },
        deleted_at: { type: ["string", "null"], format: "date-time" },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    company: {
      relation: Model.BelongsToOneRelation,
      modelClass: Companies,
      join: {
        from: "company.company_whatsapp.company_id",
        to: "company.companies.id",
      },
    },
  };
}

export default CompanyWhatsapp;