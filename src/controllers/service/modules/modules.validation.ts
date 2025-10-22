import Joi from "joi";

export const findAllModulesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().trim().allow(""),
  module_group_id: Joi.number().integer(),
  is_active: Joi.boolean(),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i),
  withGroup: Joi.boolean().default(false),
  withApiScopes: Joi.boolean().default(false),
});

export const moduleIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export const createModuleSchema = Joi.object({
  module_group_id: Joi.number().integer().required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().allow(null, ""),
  is_active: Joi.boolean().default(true),
});

export const updateModuleSchema = Joi.object({
  module_group_id: Joi.number().integer(),
  name: Joi.string().max(200),
  description: Joi.string().allow(null, ""),
  is_active: Joi.boolean(),
}).min(1);
