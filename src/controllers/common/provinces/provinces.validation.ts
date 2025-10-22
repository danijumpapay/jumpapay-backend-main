import Joi from "joi";

export const findAllProvincesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().trim().allow(""),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i),
  withCities: Joi.boolean().default(false),
});

export const provinceIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export const createProvinceSchema = Joi.object({
  name: Joi.string().max(200).required(),
  description: Joi.string().allow(null, ""),
});

export const updateProvinceSchema = Joi.object({
  name: Joi.string().max(200),
  description: Joi.string().allow(null, ""),
}).min(1);
