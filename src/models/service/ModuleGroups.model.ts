import { Model } from "objection";
import knex from "@config/connection";
import Modules from "./Modules.model";

Model.knex(knex);

class ModuleGroups extends Model {
  id!: number;
  name!: string;
  description?: string | null;

  static get tableName() {
    return "service.module_groups";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "name"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", maxLength: 200 },
        description: { type: ["string", "null"] },
      },
    };
  }
  
  static relationMappings = {
    modules: {
      relation: Model.HasManyRelation,
      modelClass: Modules,
      join: {
        from: "service.module_groups.id",
        to: "service.modules.module_group_id",
      },
    },
  };
}

export default ModuleGroups;