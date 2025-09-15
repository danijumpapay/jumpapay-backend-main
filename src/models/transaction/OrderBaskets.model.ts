import { Model } from "objection";
import knex from "@config/connection";
import Orders from "./Orders.model";

Model.knex(knex);

class OrderBaskets extends Model {
  id!: string;
  order_id!: string;
  expired_at?: string | null;
  created_at?: string;

  static get tableName() {
    return "transaction.order_baskets";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "order_id"],
      properties: {
        id: { type: "string", maxLength: 200 },
        order_id: { type: "string", maxLength: 200 },
        expired_at: { type: ["string", "null"], format: "date-time" },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    order: {
      relation: Model.BelongsToOneRelation,
      modelClass: Orders,
      join: {
        from: "transaction.order_baskets.order_id",
        to: "transaction.orders.id",
      },
    },
  };
}

export default OrderBaskets;