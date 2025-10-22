import Joi from "joi";

const feeTypes = ["FLAT", "FORMULA"] as const;

export const findAllJumpapayFeeServicesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  offset: Joi.number().integer().min(0).default(0),
  jumpapay_fee_id: Joi.number().integer(),
  service_id: Joi.number().integer(),
  order_fee_name: Joi.number().integer().min(0).max(9999),
  order_fee_group: Joi.number().integer().min(0).max(9999),
  type: Joi.string().valid(...feeTypes),
  is_active: Joi.boolean(),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i),
});

export const jumpapayFeeServiceIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export const createJumpapayFeeServiceSchema = Joi.object({
  jumpapay_fee_id: Joi.number().integer().required(),
  service_id: Joi.number().integer().required(),
  order_fee_name: Joi.number().integer().min(0).max(9999).required(),
  order_fee_group: Joi.number().integer().min(0).max(9999).required(),
  type: Joi.string()
    .valid(...feeTypes)
    .required(),

  value: Joi.number()
    .precision(2)
    .when("type", { is: "FLAT", then: Joi.required(), otherwise: Joi.allow(null) }),
  formula: Joi.string().when("type", {
    is: "FORMULA",
    then: Joi.required(),
    otherwise: Joi.allow(null, ""),
  }),
  is_active: Joi.boolean().default(true),
});

export const updateJumpapayFeeServiceSchema = Joi.object({
  jumpapay_fee_id: Joi.number().integer(),
  service_id: Joi.number().integer(),
  order_fee_name: Joi.number().integer().min(0).max(9999),
  order_fee_group: Joi.number().integer().min(0).max(9999),
  type: Joi.string().valid(...feeTypes),
  value: Joi.number().precision(2).allow(null),
  formula: Joi.string().allow(null, ""),
  is_active: Joi.boolean(),
})
  .min(1)
  .with("type", ["value", "formula"]);
