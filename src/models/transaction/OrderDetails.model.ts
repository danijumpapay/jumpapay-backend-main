import { Model } from "objection";
import knex from "@config/connection";
import Orders from "./Orders.model";
import Services from "@models/service/Services.model";
import OrderDetailFees from "./OrderDetailFees.model";
import OrderDetailDocuments from "./OrderDetailDocuments.model";

Model.knex(knex);

type VehicleTypeEnum = "CAR" | "MOTORCYCLE";
type DetailTypeEnum = "RETURN" | "PICKUP";

class OrderDetails extends Model {
  id!: string;
  order_id!: string;
  service_id!: number;
  vehicle_type?: VehicleTypeEnum;
  price?: number | null;
  type?: DetailTypeEnum;

  static get tableName() {
    return "transaction.order_details";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "order_id", "service_id"],
      properties: {
        id: { type: "string", maxLength: 200 },
        order_id: { type: "string", maxLength: 200 },
        service_id: { type: "integer" },
        vehicle_type: { type: ["string", "null"], enum: ["CAR", "MOTORCYCLE"] },
        price: { type: ["number", "null"] },
        type: { type: ["string", "null"], enum: ["RETURN", "PICKUP"] },
      },
    };
  }
  
  static relationMappings = {
    order: {
      relation: Model.BelongsToOneRelation,
      modelClass: Orders,
      join: {
        from: "transaction.order_details.order_id",
        to: "transaction.orders.id",
      },
    },
    service: {
      relation: Model.BelongsToOneRelation,
      modelClass: Services,
      join: {
        from: "transaction.order_details.service_id",
        to: "service.services.id",
      },
    },
    fees: {
      relation: Model.HasManyRelation,
      modelClass: OrderDetailFees,
      join: {
        from: "transaction.order_details.id",
        to: "transaction.order_detail_fees.order_detail_id"
      }
    },
    documents: {
      relation: Model.HasManyRelation,
      modelClass: OrderDetailDocuments,
      join: {
        from: "transaction.order_details.id",
        to: "transaction.order_detail_documents.order_detail_id"
      }
    }
  };
}

export default OrderDetails;