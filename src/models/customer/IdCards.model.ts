import { Model } from "objection";
import knex from "../../config/connection";
import Users from "../../models/user/Users.model";

Model.knex(knex);

class IdCards extends Model {
  id!: string;
  user_id!: string;
  nik?: string | null;
  gender?: "MALE" | "FEMALE" | null;
  job?: string | null;
  blood_type?: string | null;
  religion?: string | null;
  image?: string | null;
  deleted_at?: string | null;
  created_at?: string | null;

  static get tableName() {
    return "customer.id_cards";
  }

  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("customer.id_cards.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await IdCards.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "user_id"],

      properties: {
        id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        nik: { type: ["string", "null"], maxLength: 30 },
        gender: { type: ["string", "null"], enum: ["MALE", "FEMALE"] },
        job: { type: ["string", "null"], maxLength: 200 },
        blood_type: { type: ["string", "null"], maxLength: 10 },
        religion: { type: ["string", "null"], maxLength: 100 },
        image: { type: ["string", "null"] },
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
        from: "customer.id_cards.user_id",
        to: "user.users.id",
      },
    },
  };
}

export default IdCards;
