import { Model } from "objection";
import knex from "../../config/connection";
import JumpapayFees from "./JumpapayFees.model";
import Services from "@models/service/Services.model";

Model.knex(knex);

class JumpapayFeeServices extends Model {
  jumpapay_fee_id!: number;
  service_id!: number;

  static get tableName() {
    return "common.jumpapay_fee_services";
  }

  static get idColumn() {
    return ["jumpapay_fee_id", "service_id"];
  }
  
  static get jsonSchema() {
    return {
      type: "object",
      required: ["jumpapay_fee_id", "service_id"],
      properties: {
        jumpapay_fee_id: { type: "integer" },
        service_id: { type: "integer" },
      },
    };
  }

  static relationMappings = {
    fee: {
      relation: Model.BelongsToOneRelation,
      modelClass: JumpapayFees,
      join: {
        from: "common.jumpapay_fee_services.jumpapay_fee_id",
        to: "common.jumpapay_fees.id",
      },
    },
    service: {
      relation: Model.BelongsToOneRelation,
      modelClass: Services,
      join: {
        from: "common.jumpapay_fee_services.service_id",
        to: "service.services.id",
      },
    },
  };
}

export default JumpapayFeeServices;