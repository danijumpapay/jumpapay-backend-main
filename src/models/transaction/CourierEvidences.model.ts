import { Model } from "objection";
import knex from "@config/connection";
import Orders from "./Orders.model";
import Users from "@models/user/Users.model";

Model.knex(knex);

type FileType = "IMAGE" | "VIDEO";
type DeliveryType = "RETURN" | "PICKUP";

class CourierEvidences extends Model {
  id!: string;
  order_id!: string;
  user_id!: string;
  file?: string | null;
  file_type?: FileType;
  delivery_type?: DeliveryType;
  created_at?: string;
  deleted_at?: string | null;

  static get tableName() {
    return "transaction.courier_evidences";
  }
  
  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("transaction.courier_evidences.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await CourierEvidences.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "order_id", "user_id"],
      properties: {
        id: { type: "string" }, // uuid
        order_id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        file: { type: ["string", "null"] },
        file_type: { type: ["string", "null"], enum: ["IMAGE", "VIDEO"] },
        delivery_type: { type: ["string", "null"], enum: ["RETURN", "PICKUP"] },
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
        from: "transaction.courier_evidences.order_id",
        to: "transaction.orders.id",
      },
    },
    courier: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "transaction.courier_evidences.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default CourierEvidences;