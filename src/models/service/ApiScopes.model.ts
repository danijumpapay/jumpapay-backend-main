import { Model } from "objection";
import knex from "@config/connection";
import Modules from "./Modules.model";
import AccessTokens from "./AccessTokens.model";

Model.knex(knex);

type AccessType = "READ" | "WRITE" | "DELETE" | "UPDATE" | "MANAGE" | "*";

class ApiScopes extends Model {
  id!: number;
  module_id!: number;
  access!: AccessType;
  description?: string | null;

  static get tableName() {
    return "service.api_scopes";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "module_id", "access"],
      properties: {
        id: { type: "integer" },
        module_id: { type: "integer" },
        access: { type: "string", enum: ["READ", "WRITE", "DELETE", "UPDATE", "MANAGE", "*"] },
        description: { type: ["string", "null"] },
      },
    };
  }
  
  static relationMappings = {
    module: {
      relation: Model.BelongsToOneRelation,
      modelClass: Modules,
      join: {
        from: "service.api_scopes.module_id",
        to: "service.modules.id",
      },
    },
    accessTokens: {
        relation: Model.ManyToManyRelation,
        modelClass: AccessTokens,
        join: {
            from: "service.api_scopes.id",
            through: {
                from: "service.token_scopes.api_scope_id",
                to: "service.token_scopes.access_token_id"
            },
            to: "service.access_tokens.id"
        }
    }
  };
}

export default ApiScopes;