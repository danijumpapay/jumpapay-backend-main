import { Model } from "objection";
import knex from "../../config/connection";
import Orders from "./Orders.model";
import Addresses from "../customer/Addresses.model";

Model.knex(knex);

class OrderAddresses extends Model {
  id!: string;
  order_id!: string;
  address_id!: string;
  price!: number;
  type!: "RETURN" | "PICKUP";

  static get tableName() {
    return "transaction.order_addresses";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["order_id", "address_id", "price", "type"],

      properties: {
        id: { type: "string", format: "uuid" },
        order_id: { type: "string", maxLength: 200 },
        address_id: { type: "string", maxLength: 200 },
        price: { type: "number" },
        type: { type: "string", enum: ["RETURN", "PICKUP"] },
      },
    };
  }

  static relationMappings = {
    order: {
      relation: Model.BelongsToOneRelation,
      modelClass: Orders,
      join: {
        from: "transaction.order_addresses.order_id",
        to: "transaction.orders.id",
      },
    },
    address: {
      relation: Model.BelongsToOneRelation,
      modelClass: Addresses,
      join: {
        from: "transaction.order_addresses.address_id",
        to: "customer.addresses.id",
      },
    },
  };
}

export default OrderAddresses;
