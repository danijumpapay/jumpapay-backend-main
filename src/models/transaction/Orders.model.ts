import { Model } from "objection";
import knex from "@config/connection";
import Users from "@models/user/Users.model";
import Companies from "@models/company/Companies.model";
import OrderStatus from "@models/common/OrderStatus.model";
import Cities from "@models/common/Cities.model";
import OrderDetails from "./OrderDetails.model";
import OrderAddresses from "./OrderAddresses.model";
import OrderNotes from "./OrderNotes.model";

Model.knex(knex);

type OrderType = "INVOICING" | "NON INVOICING";

class Orders extends Model {
  id!: string;
  user_id?: string | null;
  company_id?: string | null;
  order_status_id!: number;
  booking_id?: string | null;
  phone?: string | null;
  city_id?: number | null;
  source?: string | null;
  status?: string | null;
  paid_at?: string | null;
  order_type?: OrderType | null;
  payment_type?: string | null;
  deleted_at?: string | null;
  created_at?: string;

  static get tableName() {
    return "transaction.orders";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("transaction.orders.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await Orders.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "order_status_id"],
      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: ["string", "null"], maxLength: 200 },
        company_id: { type: ["string", "null"], maxLength: 100 },
        order_status_id: { type: "integer" },
        booking_id: { type: ["string", "null"], maxLength: 100 },
        phone: { type: ["string", "null"], maxLength: 30 },
        city_id: { type: ["integer", "null"] },
        source: { type: ["string", "null"], maxLength: 100 },
        status: { type: ["string", "null"], maxLength: 100 },
        paid_at: { type: ["string", "null"], format: "date-time" },
        order_type: { type: ["string", "null"], enum: ["INVOICING", "NON INVOICING"] },
        payment_type: { type: ["string", "null"], maxLength: 200 },
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
        from: "transaction.orders.user_id",
        to: "user.users.id",
      },
    },
    company: {
        relation: Model.BelongsToOneRelation,
        modelClass: Companies,
        join: {
            from: "transaction.orders.company_id",
            to: "company.companies.id"
        }
    },
    orderStatus: {
        relation: Model.BelongsToOneRelation,
        modelClass: OrderStatus,
        join: {
            from: "transaction.orders.order_status_id",
            to: "common.order_status.id"
        }
    },
    city: {
        relation: Model.BelongsToOneRelation,
        modelClass: Cities,
        join: {
            from: "transaction.orders.city_id",
            to: "common.cities.id"
        }
    },
    details: {
        relation: Model.HasManyRelation,
        modelClass: OrderDetails,
        join: {
            from: "transaction.orders.id",
            to: "transaction.order_details.order_id"
        }
    },
    addresses: {
        relation: Model.HasManyRelation,
        modelClass: OrderAddresses,
        join: {
            from: "transaction.orders.id",
            to: "transaction.order_addresses.order_id"
        }
    },
    notes: {
        relation: Model.HasManyRelation,
        modelClass: OrderNotes,
        join: {
            from: "transaction.orders.id",
            to: "transaction.order_notes.order_id"
        }
    }
  };
}

export default Orders;