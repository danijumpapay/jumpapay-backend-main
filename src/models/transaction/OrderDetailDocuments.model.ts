import { Model } from "objection";
import knex from "@config/connection";
import OrderDetails from "./OrderDetails.model";
import Users from "@models/user/Users.model";

Model.knex(knex);

type DocumentName = "STNK" | "BPKB" | "SKPD" | "KTP" | "OTHERS";

class OrderDetailDocuments extends Model {
  id!: string;
  order_detail_id!: string;
  uploaded_by!: string;
  name?: DocumentName;
  document?: string | null;
  created_at?: string;

  static get tableName() {
    return "transaction.order_detail_documents";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "order_detail_id", "uploaded_by"],
      properties: {
        id: { type: "string" }, // uuid
        order_detail_id: { type: "string", maxLength: 200 },
        uploaded_by: { type: "string", maxLength: 200 },
        name: { type: ["string", "null"], enum: ["STNK", "BPKB", "SKPD", "KTP", "OTHERS"] },
        document: { type: ["string", "null"] },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    orderDetail: {
      relation: Model.BelongsToOneRelation,
      modelClass: OrderDetails,
      join: {
        from: "transaction.order_detail_documents.order_detail_id",
        to: "transaction.order_details.id",
      },
    },
    uploader: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "transaction.order_detail_documents.uploaded_by",
        to: "user.users.id",
      },
    },
  };
}

export default OrderDetailDocuments;