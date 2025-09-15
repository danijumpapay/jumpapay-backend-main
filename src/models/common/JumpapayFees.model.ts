import { Model } from "objection";
import knex from "@config/connection";
import path from "path";
import Services from "@models/service/Services.model";

Model.knex(knex);

type FeeType = "FLAT" | "FORMULA";

class JumpapayFees extends Model {
  id!: number;
  name?: string;
  code?: string;
  type?: FeeType;
  value?: number | null;
  formula?: string | null;
  is_active?: boolean | null;
  created_at?: string;
  deleted_at?: string | null;

  static get tableName() {
    return "common.jumpapay_fees";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("common.jumpapay_fees.deleted_at");
  }

  static async softDelete(id: number): Promise<void> {
    await JumpapayFees.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "code", "type"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", maxLength: 200 },
        code: { type: "string", maxLength: 100 },
        type: { type: "string", enum: ["FLAT", "FORMULA"] },
        value: { type: ["number", "null"] },
        formula: { type: ["string", "null"] },
        is_active: { type: ["boolean", "null"], default: true },
        created_at: { type: ["string", "null"], format: "date-time" },
        deleted_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    services: {
      relation: Model.ManyToManyRelation,
      modelClass: path.join(__dirname, "../service/Services.model"), // Sesuaikan path jika perlu
      join: {
        from: "common.jumpapay_fees.id",
        through: {
          from: "common.jumpapay_fee_services.jumpapay_fee_id",
          to: "common.jumpapay_fee_services.service_id",
        },
        to: "service.services.id",
      },
    },
  };
}

export default JumpapayFees;