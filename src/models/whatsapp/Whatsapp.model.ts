import { Model } from "objection";
import knex from "@config/connection";

Model.knex(knex);

class Whatsapp extends Model {
  id!: string;
  group_id!: number;
  phone_id!: string;
  wab_id!: string;
  phone!: string;
  name!: string;
  avatar?: string;
  address?: string;
  email?: string;
  website?: string;
  description?: string;
  access_token?: string;
  webhook?: string;
  webhook_token?: string;
  is_active?: boolean | null;
  deleted_at?: string | null;
  created_at?: Date;
  updated_at?: string | null;

  static get tableName() {
    return "whatsapp.whatsapp";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "group_id", "phone_id", "wab_id", "phone", "name"],
      properties: {
        id: { type: "string", maxLength: 200 },
        group_id: { type: "string", maxLength: 200 },
        phone_id: { type: "string", maxLength: 200 },
        wab_id: { type: "string", maxLength: 200 },
        phone: { type: "string", maxLength: 200 },
        name: { type: "string", maxLength: 200 },
        avatar: { type: "string", maxLength: 200 },
        address: { type: "string", maxLength: 200 },
        email: { type: "string", maxLength: 200 },
        website: { type: "string", maxLength: 200 },
        description: { type: "string", maxLength: 200 },
        access_token: { type: "string", maxLength: 200 },
        webhook: { type: "string", maxLength: 200 },
        webhook_token: { type: "string", maxLength: 200 },
        is_active: { type: "string", maxLength: 200 },
        created_at: { type: "string" },
        updated_at: { type: ["string", "null"] },
        deleted_at: { type: ["string", "null"] },
      },
    };
  }
}

export default Whatsapp;
