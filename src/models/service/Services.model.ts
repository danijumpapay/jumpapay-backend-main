import { Model } from "objection";
import knex from "@config/connection";
import JumpapayFees from "@models/common/JumpapayFees.model"

Model.knex(knex);

type ServiceStatus = "DRAFT" | "REVIEW" | "PUBLISH";

class Services extends Model {
  id!: number;
  name!: string;
  slug!: string;
  price?: number | null;
  is_fixed_price?: boolean | null;
  description?: string | null;
  is_public?: boolean | null;
  is_id_card_required?: boolean | null;
  is_stnk_required?: boolean | null;
  is_bpkb_required?: boolean | null;
  is_skpd_required?: boolean | null;
  image?: string | null;
  status?: ServiceStatus;
  created_at?: string;
  deleted_at?: string | null;

  static get tableName() {
    return "service.services";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("service.services.deleted_at");
  }

  static async softDelete(id: number): Promise<void> {
    await Services.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name", "slug"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", maxLength: 200 },
        slug: { type: "string", maxLength: 200 },
        price: { type: ["number", "null"] },
        is_fixed_price: { type: ["boolean", "null"] },
        description: { type: ["string", "null"] },
        is_public: { type: ["boolean", "null"] },
        is_id_card_required: { type: ["boolean", "null"] },
        is_stnk_required: { type: ["boolean", "null"] },
        is_bpkb_required: { type: ["boolean", "null"] },
        is_skpd_required: { type: ["boolean", "null"] },
        image: { type: ["string", "null"] },
        status: { type: ["string", "null"], enum: ["DRAFT", "REVIEW", "PUBLISH"] },
        created_at: { type: ["string", "null"], format: "date-time" },
        deleted_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    jumpapayFees: {
      relation: Model.ManyToManyRelation,
      modelClass: JumpapayFees,
      join: {
        from: "service.services.id",
        through: {
          from: "common.jumpapay_fee_services.service_id",
          to: "common.jumpapay_fee_services.jumpapay_fee_id",
        },
        to: "common.jumpapay_fees.id",
      },
    },
  };
}

export default Services;