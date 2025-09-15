import { Model } from "objection";
import knex from "@config/connection";
import ApiScopes from "./ApiScopes.model";
import AccessTokens from "./AccessTokens.model";

Model.knex(knex);

class TokenScopes extends Model {
  api_scope_id!: number;
  access_token_id!: string;

  static get tableName() {
    return "service.token_scopes";
  }
  
  static get idColumn() {
    return ["api_scope_id", "access_token_id"];
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["api_scope_id", "access_token_id"],
      properties: {
        api_scope_id: { type: "integer" },
        access_token_id: { type: "string", format: "uuid"},
      },
    };
  }

  static relationMappings = {
    scope: {
        relation: Model.BelongsToOneRelation,
        modelClass: ApiScopes,
        join: {
            from: "service.token_scopes.api_scope_id",
            to: "service.api_scopes.id"
        }
    },
    token: {
        relation: Model.BelongsToOneRelation,
        modelClass: AccessTokens,
        join: {
            from: "service.token_scopes.access_token_id",
            to: "service.access_tokens.id"
        }
    }
  };
}

export default TokenScopes;