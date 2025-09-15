import { Model } from "objection";
import knex from "@config/connection";
import Users from "@models/user/Users.model";
import Companies from "@models/company/Companies.model";
import ApiScopes from "./ApiScopes.model";

Model.knex(knex);

type TokenStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

class AccessTokens extends Model {
  id!: string;
  api_scope_id!: number;
  company_id!: string;
  user_id!: string;
  token!: string;
  status?: TokenStatus;
  expired_at?: string | null;
  deleted_at?: string | null;
  created_at?: string;

  static get tableName() {
    return "service.access_tokens";
  }
  
  static querySoftDelete(...args: any) {
    return super.query(...args).whereNull("service.access_tokens.deleted_at");
  }

  static async softDelete(id: string): Promise<void> {
    await AccessTokens.query()
      .findById(id)
      .patch({
        deleted_at: new Date().toISOString(),
      });
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "api_scope_id", "company_id", "user_id", "token"],
      properties: {
        id: { type: "string" }, // uuid
        api_scope_id: { type: "integer" },
        company_id: { type: "string", maxLength: 200 },
        user_id: { type: "string", maxLength: 200 },
        token: { type: "string" },
        status: { type: ["string", "null"], enum: ["ACTIVE", "REVOKED", "EXPIRED"] },
        expired_at: { type: ["string", "null"], format: "date-time" },
        deleted_at: { type: ["string", "null"], format: "date-time" },
        created_at: { type: ["string", "null"], format: "date-time" },
      },
    };
  }
  
  static relationMappings = {
    company: {
        relation: Model.BelongsToOneRelation,
        modelClass: Companies,
        join: {
            from: "service.access_tokens.company_id",
            to: "company.companies.id"
        }
    },
    user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Users,
        join: {
            from: "service.access_tokens.user_id",
            to: "user.users.id"
        }
    },
    scopes: {
        relation: Model.ManyToManyRelation,
        modelClass: ApiScopes,
        join: {
            from: "service.access_tokens.id",
            through: {
                from: "service.token_scopes.access_token_id",
                to: "service.token_scopes.api_scope_id"
            },
            to: "service.api_scopes.id"
        }
    }
  };
}

export default AccessTokens;