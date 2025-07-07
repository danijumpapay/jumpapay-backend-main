import { Model } from "objection";
import knex from "../../config/connection";
import Users from "../../models/user/Users.model";
import Vehicles from "../../models/customer/Vehicles.model";

Model.knex(knex);

class StnkDocuments extends Model {
  id!: string;
  user_id!: string;
  vehicle_id!: string;
  stnk_number!: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  tax_due_date?: string | null;
  is_active?: boolean;
  image?: string | null;
  deleted_at?: string | null;
  created_at?: Date;
  updated_at?: Date;

  static get tableName() {
    return "customer.stnk_documents";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("customer.stnk_documents.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await StnkDocuments.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString()
      });
  }
  
  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id", "vehicle_id", "stnk_number"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        vehicle_id: { type: "string", maxLength: 200 },
        stnk_number: { type: "string", maxLength: 100 },
        issue_date: { type: ["string", "null"], format: "date-time" },
        expiry_date: { type: ["string", "null"], format: "date-time" },
        tax_due_date: { type: ["string", "null"], format: "date-time" },
        is_active: { type: ["boolean"], default: false },
        image: { type: ["string", "null"] },
        deleted_at: { type: ["string", "null"], format: "date-time" },
        created_at: { type: "string" },
        updated_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  // Relation Mappings
  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "customer.stnk_documents.user_id",
        to: "user.users.id",
      },
    },
    vehicle: {
      relation: Model.BelongsToOneRelation,
      modelClass: Vehicles,
      join: {
        from: "customer.stnk_documents.vehicle_id",
        to: "customer.vehicles.id",
      },
    },
  };
}

export default StnkDocuments;
