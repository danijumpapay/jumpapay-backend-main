import { Model } from "objection";
import knex from "@config/connection";
import Orders from "./Orders.model";

Model.knex(knex);

class OrderNotes extends Model {
  id!: string;
  order_id!: string;
  note?: string | null;
  created_by?: any; // jsonb
  created_at?: string;
  deleted_at?: string | null;

  static get tableName() {
    return "transaction.order_notes";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("transaction.order_notes.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await OrderNotes.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "order_id"],
      properties: {
        id: { type: "string" }, // uuid
        order_id: { type: "string", maxLength: 200 },
        note: { type: ["string", "null"] },
        created_by: { type: ["object", "null"] },
        created_at: { type: ["string", "null"], format: "date-time" },
        deleted_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }
  
  static relationMappings = {
    order: {
      relation: Model.BelongsToOneRelation,
      modelClass: Orders,
      join: {
        from: "transaction.order_notes.order_id",
        to: "transaction.orders.id",
      },
    },
  };
}

export default OrderNotes;