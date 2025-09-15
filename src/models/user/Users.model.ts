import { Model } from "objection";
import knex from "@config/connection";
import UserEmails from "./UserEmails.model";
import UserSosialMedia from "./UserSosialMedia.model";
import UserActivities from "./UserActivities.model";
import UserOtp from "./UserOtp.model";
import UserTokens from "./UserTokens.model";
import IdCards from "@models/customer/IdCards.model";
import Addresses from "@models/customer/Addresses.model";
import Vehicles from "@models/customer/Vehicles.model";
import Orders from "@models/transaction/Orders.model";
import Companies from "@models/company/Companies.model";

Model.knex(knex);

type UserRole = "GOD" | "SUPERUSER" | "ADMIN" | "VIP" | "CUSTOMER" | "INTERNAL";

class Users extends Model {
  id!: string;
  name?: string | null;
  alias?: string | null;
  username?: string | null;
  password?: string | null;
  avatar?: string | null;
  about?: string | null;
  role?: UserRole;
  phone?: string | null;
  is_reviewer?: boolean;
  is_active?: boolean;
  is_multi_device?: boolean | null;
  verified_at?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;

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
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", maxLength: 200 },
        name: { type: ["string", "null"], maxLength: 200 },
        alias: { type: ["string", "null"], maxLength: 50 },
        username: { type: ["string", "null"], maxLength: 100 },
        password: { type: ["string", "null"] },
        avatar: { type: ["string", "null"] },
        about: { type: ["string", "null"] },
        role: { type: "string", enum: ["GOD", "SUPERUSER", "ADMIN", "VIP", "CUSTOMER", "INTERNAL"] },
        phone: { type: ["string", "null"], maxLength: 30 },
        is_reviewer: { type: "boolean", default: false },
        is_active: { type: "boolean", default: false },
        is_multi_device: { type: ["boolean", "null"] },
        verified_at: { type: ["string", "null"], format: "date-time" },
        deleted_at: { type: ["string", "null"], format: "date-time" },
        created_at: { type: ["string", "null"], format: "date-time" },
        updated_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    emails: {
      relation: Model.HasManyRelation,
      modelClass: UserEmails,
      join: { from: "user.users.id", to: "user.user_emails.user_id" },
    },
    sosialMedia: {
      relation: Model.HasManyRelation,
      modelClass: UserSosialMedia,
      join: { from: "user.users.id", to: "user.user_sosial_media.user_id" },
    },
    activities: {
      relation: Model.HasManyRelation,
      modelClass: UserActivities,
      join: { from: "user.users.id", to: "user.user_activities.user_id" },
    },
    otps: {
        relation: Model.HasManyRelation,
        modelClass: UserOtp,
        join: { from: "user.users.id", to: "user.user_otp.user_id" },
    },
    tokens: {
        relation: Model.HasManyRelation,
        modelClass: UserTokens,
        join: { from: "user.users.id", to: "user.user_tokens.user_id" },
    },
    idCards: {
        relation: Model.HasManyRelation,
        modelClass: IdCards,
        join: { from: "user.users.id", to: "customer.id_cards.user_id" },
    },
    addresses: {
        relation: Model.HasManyRelation,
        modelClass: Addresses,
        join: { from: "user.users.id", to: "customer.addresses.user_id" },
    },
    vehicles: {
        relation: Model.HasManyRelation,
        modelClass: Vehicles,
        join: { from: "user.users.id", to: "customer.vehicles.user_id" },
    },
    orders: {
      relation: Model.HasManyRelation,
      modelClass: Orders,
      join: { from: "user.users.id", to: "transaction.orders.user_id" },
    },
    companies: {
      relation: Model.ManyToManyRelation,
      modelClass: Companies,
      join: {
          from: "user.users.id",
          through: {
              from: "company.company_employees.user_id",
              to: "company.company_employees.company_id"
          },
          to: "company.companies.id"
      }
    }
  };
}

export default Users;