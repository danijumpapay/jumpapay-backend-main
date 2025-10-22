import Joi from "joi";
const accessTypes = ["READ", "WRITE", "DELETE", "UPDATE", "MANAGE", "*"] as const;

export const findAllApiScopesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  module_id: Joi.number().integer().label("Module ID"),
  access: Joi.string()
    .valid(...accessTypes)
    .label("Access Type"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withModule: Joi.boolean().default(false).label("Include Module Data"),
});

export const apiScopeIdSchema = Joi.object({
  id: Joi.number().integer().required().label("API Scope ID"),
});

export const createApiScopeSchema = Joi.object({
  module_id: Joi.number().integer().required().label("Module ID"),
  access: Joi.string()
    .valid(...accessTypes)
    .required()
    .label("Access Type"),
  description: Joi.string().allow(null, "").label("Description"),
});

export const updateApiScopeSchema = Joi.object({
  module_id: Joi.number().integer().label("Module ID"),
  access: Joi.string()
    .valid(...accessTypes)
    .label("Access Type"),
  description: Joi.string().allow(null, "").label("Description"),
})
  .min(1)
  .label("Update API Scope Data");
