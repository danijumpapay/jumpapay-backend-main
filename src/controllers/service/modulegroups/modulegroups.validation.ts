import Joi from "joi";

export const findAllModuleGroupsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  search: Joi.string().trim().allow("").label("Search term (by name)"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withModules: Joi.boolean().default(false).label("Include Modules Data"),
});

export const moduleGroupIdSchema = Joi.object({
  id: Joi.number().integer().required().label("Module Group ID"),
});

export const createModuleGroupSchema = Joi.object({
  name: Joi.string().max(200).required().label("Group Name"),
  description: Joi.string().allow(null, "").label("Description"),
});

export const updateModuleGroupSchema = Joi.object({
  name: Joi.string().max(200).label("Group Name"),
  description: Joi.string().allow(null, "").label("Description"),
})
  .min(1)
  .label("Update Module Group Data");
