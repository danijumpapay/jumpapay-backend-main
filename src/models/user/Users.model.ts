import { Model } from "objection";
import knex from "../../config/connection";

Model.knex(knex);

class Users extends Model {
  id!: string;
  name?: string;
  alias?: string | null;
  username?: string | null;
  password?: string | null;
  avatar?: string | null;
  about?: string | null;
  role?: "GOD" | "SUPERUSER" | "ADMIN" | "VIP" | "CUSTOMER";
  phone?: string;
  is_reviewer?: boolean;
  is_active?: boolean;
  is_multi_device?: boolean;
  verified_at?: string | null;
  deleted_at?: string | null;
  created_at?: Date;
  updated_at?: Date;

  static get tableName() {
    return "user.users";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("user.users.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await Users.query()
      .findById(id)
      .patch({
        username: Users.raw("NULL"),
        phone: Users.raw("NULL"),
        deleted_at: new Date().toISOString()
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "phone"],

      properties: {
        id: { type: "string", maxLength: 200 },
        name: { type: ["string", "null"], maxLength: 200 },
        alias: { type: ["string", "null"], maxLength: 50 },
        username: { type: ["string", "null"], maxLength: 100 },
        password: { type: ["string", "null"] },
        avatar: { type: ["string", "null"] },
        about: { type: ["string", "null"] },
        role: {
          type: ["string", "null"],
          enum: ["GOD", "SUPERUSER", "ADMIN", "VIP", "CUSTOMER"],
        },
        phone: { type: ["string", "null"], maxLength: 30 },
        is_reviewer: { type: ["boolean"], default: false },
        is_active: { type: ["boolean"], default: false },
        is_multi_device: { type: ["boolean"] },
        verified_at: { type: ["string", "null"] },
        deleted_at: { type: ["string", "null"] },
        created_at: { type: "string" },
        updated_at: { type: ["string", "null"] },
      },
    };
  }

}

export default Users;
