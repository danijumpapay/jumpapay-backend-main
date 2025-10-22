import Joi from "joi";

export const findAllCityPlatesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  offset: Joi.number().integer().min(0).default(0),
  city_id: Joi.number().integer(),
  plate_id: Joi.number().integer(),
  is_active: Joi.boolean(),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i),
});

export const cityPlateIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const cityPlateCompositeKeySchema = Joi.object({
  city_id: Joi.number().integer().required(),
  plate_id: Joi.number().integer().required(),
});

export const createCityPlateSchema = Joi.object({
  city_id: Joi.number().integer().required(),
  plate_id: Joi.number().integer().required(),
  is_active: Joi.boolean().default(true),
});

export const updateCityPlateSchema = Joi.object({
  is_active: Joi.boolean().required(),
});
