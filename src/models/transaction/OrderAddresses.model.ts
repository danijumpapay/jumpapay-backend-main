import { Model } from "objection";
import knex from "@config/connection";
import Orders from "./Orders.model";
import Addresses from "@models/customer/Addresses.model";
import Users from "@models/user/Users.model";

Model.knex(knex);

type DeliveryType = "RETURN" | "PICKUP";
type DeliveryStatus = "WAITING FOR DRIVER" | "ON THE WAY" | "COMPLETED";

class OrderAddresses extends Model {
  id!: string;
  order_id!: string;
  address_id!: string;
  user_id?: string | null;
  price?: number | null;
  status?: DeliveryStatus;
  delivery_type?: DeliveryType;
  created_at?: string;

  static get tableName() {
    return "transaction.order_addresses";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "order_id", "address_id"],
      properties: {
        id: { type: "string" }, // uuid
        order_id: { type: "string", maxLength: 200 },
        address_id: { type: "string", maxLength: 200 },
        user_id: { type: ["string", "null"], maxLength: 200 },
        price: { type: ["number", "null"] },
        status: { type: ["string", "null"], enum: ["WAITING FOR DRIVER", "ON THE WAY", "COMPLETED"] },
        delivery_type: { type: ["string", "null"], enum: ["RETURN", "PICKUP"] },
        created_at: { type: ["string", "null"], format: "date-time" },
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
            to: "customer.addresses.id"
        }
    },
    user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
            from: "transaction.order_addresses.user_id",
            to: "user.users.id"
        }
    }
  };
}

export default OrderAddresses;