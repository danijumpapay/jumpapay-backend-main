import { Model } from "objection";
import knex from "@config/connection";

Model.knex(knex);

class Chats extends Model {
  id!: string;
  phone_id!: string;
  phone!: string;
  name!: string;
  avatar?: string | null;
  last_seen?: string | null;
  taken_by?: string | null;
  password?: string | null;
  is_read?: boolean;
  is_session_active?: boolean;
  total_unread_message?: number;
  last_message?: any | null;
  last_message_at?: string | null;
  deleted_at?: string | null;
  created_at?: Date;

  static get tableName() {
    return "whatsapp.chats";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "phone", "phone_id"],

      properties: {
        id: { type: "string", maxLength: 200 },
        phone_id: { type: "string", maxLength: 200 },
        phone: { type: "string", maxLength: 50 },
        name: { type: "string", maxLength: 200 },
        avatar: { type: "string" },
        last_seen: { type: ["string", "null"] },
        taken_by: { type: "string", maxLength: 200 },
        password: { type: "string" },
        is_read: { type: "boolean", default: false },
        is_session_active: { type: "boolean", default: false },
        total_unread_message: { type: "number", default: 0 },
        last_message: { type: "object" },
        last_message_at: { type: ["string", "null"] },
        deleted_at: { type: ["string", "null"] },
        created_at: { type: "string" },
      },
    };
  }
}

export default Chats;
