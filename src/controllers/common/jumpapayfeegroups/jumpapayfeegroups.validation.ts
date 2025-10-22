import Joi from "joi";

export const findAllJumpapayFeeGroupsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().trim().allow(""),
  is_active: Joi.boolean(),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i),
  withFees: Joi.boolean().default(false),
});

export const jumpapayFeeGroupIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export const createJumpapayFeeGroupSchema = Joi.object({
  name: Joi.string().max(200).required(),
  description: Joi.string().allow(null, ""),
  order: Joi.number().integer().allow(null),
  is_active: Joi.boolean().default(true),
});

export const updateJumpapayFeeGroupSchema = Joi.object({
  name: Joi.string().max(200),
  description: Joi.string().allow(null, ""),
  order: Joi.number().integer().allow(null),
  is_active: Joi.boolean(),
}).min(1);
