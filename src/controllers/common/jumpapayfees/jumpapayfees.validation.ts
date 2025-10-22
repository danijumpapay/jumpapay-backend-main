import Joi from "joi";

export const findAllJumpapayFeesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().trim().allow("").label("Search (by name or code)"),
  jumpapay_fee_group_id: Joi.number().integer(),
  code: Joi.string().max(100),
  is_active: Joi.boolean(),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i),
  withGroup: Joi.boolean().default(false),
  withServices: Joi.boolean().default(false),
});

export const jumpapayFeeIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export const createJumpapayFeeSchema = Joi.object({
  jumpapay_fee_group_id: Joi.number().integer().required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().allow(null, ""),
  code: Joi.string().max(100).required(),
  order: Joi.number().integer().allow(null),
  is_active: Joi.boolean().default(true),
});

export const updateJumpapayFeeSchema = Joi.object({
  jumpapay_fee_group_id: Joi.number().integer(),
  name: Joi.string().max(200),
  description: Joi.string().allow(null, ""),
  code: Joi.string().max(100),
  order: Joi.number().integer().allow(null),
  is_active: Joi.boolean(),
}).min(1);
