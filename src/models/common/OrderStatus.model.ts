import { Model } from "objection";
import knex from "../../config/connection";

Model.knex(knex);

class OrderStatus extends Model {
  id!: number;
  name?: string;
  alias?: string | null;
  is_tag?: boolean | null;
  is_active?: boolean | null;
  deleted_at?: string | null;

  static get tableName() {
    return "common.order_status";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("common.order_status.deleted_at");
  }

  static async softDelete(id: number): Promise<void> {
    await OrderStatus.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name"],
      properties: {
        id: { type: "integer" },
        name: { type: ["string", "null"], maxLength: 150 },
        alias: { type: ["string", "null"], maxLength: 200 },
        is_tag: { type: ["boolean", "null"], default: false },
        is_active: { type: ["boolean", "null"], default: true },
        deleted_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }
}

export default OrderStatus;