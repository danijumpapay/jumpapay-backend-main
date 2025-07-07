import { Model, raw } from "objection";
import knex from "../../config/connection";
import Users from "../../models/user/Users.model";
import Vehicles from "../../models/customer/Vehicles.model";

Model.knex(knex);

class BpkbDocuments extends Model {
  id!: string;
  user_id!: string;
  vehicle_id!: string;
  bpkb_number!: string;
  issue_date?: string | null;
  registration_office?: string | null;
  image?: string | null;
  is_active?: boolean;
  deleted_at?: string | null;
  created_at?: string | null;

  static get tableName() {
    return "customer.bpkb_documents";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("customer.bpkb_documents.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await BpkbDocuments.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString()
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id", "vehicle_id", "bpkb_number"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        vehicle_id: { type: "string", maxLength: 200 },
        bpkb_number: { type: "string", maxLength: 100 },
        issue_date: { type: ["string", "null"], format: "date-time" },
        registration_office: { type: ["string", "null"], maxLength: 100 },
        image: { type: ["string", "null"] },
        is_active: { type: "boolean" },
        deleted_at: { type: ["string", "null"], format: "date-time" },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Users,
      join: {
        from: "customer.bpkb_documents.user_id",
        to: "user.users.id",
      },
    },
    vehicle: {
      relation: Model.BelongsToOneRelation,
      modelClass: Vehicles,
      join: {
        from: "customer.bpkb_documents.vehicle_id",
        to: "customer.vehicles.id",
      },
    },
  };
}

export default BpkbDocuments;
