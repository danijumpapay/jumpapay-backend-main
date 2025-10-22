import Joi from "joi";
const paymentMethodType = [
  "CASH",
  "DEBIT",
  "CREDIT",
  "DIGITAL_WALLET",
  "BANK_TRANSFER",
  "E_MONEY",
] as const;

export const findAllPaymentMethodsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().trim().allow("").label("Search (by name)"),
  type: Joi.string().valid(...Object.values(paymentMethodType)),
  is_public: Joi.boolean(),
  is_active: Joi.boolean(),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i),
});

export const paymentMethodIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export const createPaymentMethodSchema = Joi.object({
  name: Joi.string().max(200).required(),
  type: Joi.string()
    .valid(...Object.values(paymentMethodType))
    .required(),
  logo: Joi.string().allow(null, ""),
  max_amount: Joi.number().precision(2).allow(null),
  is_requires_approval: Joi.boolean().default(false),
  is_requires_reference: Joi.boolean().default(false),
  is_public: Joi.boolean().default(true),
  is_active: Joi.boolean().default(true),
});

export const updatePaymentMethodSchema = Joi.object({
  name: Joi.string().max(200),
  type: Joi.string().valid(...Object.values(paymentMethodType)),
  logo: Joi.string().allow(null, ""),
  max_amount: Joi.number().precision(2).allow(null),
  is_requires_approval: Joi.boolean(),
  is_requires_reference: Joi.boolean(),
  is_public: Joi.boolean(),
  is_active: Joi.boolean(),
}).min(1);
