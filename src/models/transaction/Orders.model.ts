import { Model, raw } from "objection";
import knex from "../../config/connection";
import Users from "../../models/user/Users.model";

Model.knex(knex);

class Orders extends Model {
  id!: string;
  user_id?: string | null;
  booking_id!: string;
  phone!: string;
  city_id!: number;
  source!: string;
  paid_at?: string | null;
  payment_type!: string;
  deleted_at?: string | null;
  created_at?: Date;
  updated_at?: Date;

  static get tableName() {
    return "transaction.orders";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("transaction.orders.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await Orders.query()
      .findById(id)
      .patch({
        phone: raw("NULL"),
        deleted_at: new Date().toISOString()
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "booking_id", "phone", "city_id", "source", "payment_type"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: ["string", "null"], maxLength: 200 },
        booking_id: { type: "string", maxLength: 100 },
        phone: { type: "string", maxLength: 30 },
        city_id: { type: "integer" },
        source: { type: "string", maxLength: 100 },
        paid_at: { type: ["string", "null"], format: "date-time" },
        payment_type: { type: "string", maxLength: 200 },
        deleted_at: { type: ["string", "null"], format: "date-time" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "transaction.orders.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default Orders;
