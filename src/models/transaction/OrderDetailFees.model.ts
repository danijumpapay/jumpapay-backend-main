import { Model } from "objection";
import knex from "@config/connection";
import OrderDetails from "./OrderDetails.model";
import JumpapayFees from "@models/common/JumpapayFees.model";

Model.knex(knex);

class OrderDetailFees extends Model {
  id!: string;
  order_detail_id!: string;
  jumpapay_fee_id!: number;
  value?: number | null;

  static get tableName() {
    return "transaction.order_detail_fees";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "order_detail_id", "jumpapay_fee_id"],
      properties: {
        id: { type: "string" }, // uuid
        order_detail_id: { type: "string", maxLength: 200 },
        jumpapay_fee_id: { type: "integer" },
        value: { type: ["number", "null"] },
      },
    };
  }

  static relationMappings = {
    orderDetail: {
      relation: Model.BelongsToOneRelation,
      modelClass: OrderDetails,
      join: {
        from: "transaction.order_detail_fees.order_detail_id",
        to: "transaction.order_details.id",
      },
    },
    fee: {
      relation: Model.BelongsToOneRelation,
      modelClass: JumpapayFees,
      join: {
        from: "transaction.order_detail_fees.jumpapay_fee_id",
        to: "common.jumpapay_fees.id",
      },
    },
  };
}

export default OrderDetailFees;