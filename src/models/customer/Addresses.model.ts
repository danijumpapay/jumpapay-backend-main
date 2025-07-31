import { Model, raw } from "objection";
import knex from "../../config/connection";
import Users from "../../models/user/Users.model";
import Cities from "../../models/common/Cities.model";

Model.knex(knex);

class Addresses extends Model {
  id!: string;
  user_id!: string;
  city_id!: number;
  name?: string | null;
  address_type?: "HOUSE" | "OFFICE" | "APARTMENT" | "BOARDING_HOUSE" | null;
  province?: string | null;
  raw_address?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  postcode?: string | null;
  is_pickup_address?: boolean;
  is_return_address?: boolean;
  deleted_at?: string | null;
  created_at?: Date;
  updated_at?: Date;

  static get tableName() {
    return "customer.addresses";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("customer.addresses.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await Addresses.query()
      .findById(id)
      .patch({
        raw_address: raw("NULL"),
        deleted_at: new Date().toISOString()
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id", "city_id"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        city_id: { type: "integer" },
        name: { type: ["string", "null"], maxLength: 150 },
        address_type: { type: ["string", "null"], enum: ["HOUSE", "OFFICE", "APARTMENT", "BOARDING_HOUSE"] },
        province: { type: ["string", "null"], maxLength: 100 },
        raw_address: { type: ["string", "null"] },
        longitude: { type: ["number", "null"] },
        latitude: { type: ["number", "null"] },
        postcode: { type: ["string", "null"], maxLength: 10 },
        is_pickup_address: { type: ["boolean"], default: false },
        is_return_address: { type: ["boolean"], default: false },
        deleted_at: { type: ["string", "null"] },
        created_at: { type: "string" },
        updated_at: { type: ["string", "null"] },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "customer.addresses.user_id",
        to: "user.users.id",
      },
    },
    city: {
      relation: Model.BelongsToOneRelation,
      modelClass: Cities,
      join: {
        from: "customer.addresses.city_id",
        to: "common.cities.id",
      },
    },
  };
}

export default Addresses;
