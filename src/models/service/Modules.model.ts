import { Model } from "objection";
import knex from "@config/connection";
import ModuleGroups from "./ModuleGroups.model";
import ApiScopes from "./ApiScopes.model";

Model.knex(knex);

class Modules extends Model {
  id!: number;
  module_group_id!: number;
  name!: string;
  description?: string | null;
  is_active?: boolean | null;

  static get tableName() {
    return "service.modules";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "module_group_id", "name"],
      properties: {
        id: { type: "integer" },
        module_group_id: { type: "integer" },
        name: { type: "string", maxLength: 200 },
        description: { type: ["string", "null"] },
        is_active: { type: ["boolean", "null"] },
      },
    };
  }

  static relationMappings = {
    moduleGroup: {
      relation: Model.BelongsToOneRelation,
      modelClass: ModuleGroups,
      join: {
        from: "service.modules.module_group_id",
        to: "service.module_groups.id",
      },
    },
    apiScopes: {
      relation: Model.HasManyRelation,
      modelClass: ApiScopes,
      join: {
        from: "service.modules.id",
        to: "service.api_scopes.module_id",
      },
    },
  };
}

export default Modules;