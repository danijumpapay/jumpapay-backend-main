import Joi from "joi";

export const findAllSamsatSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().trim().allow("").label("Search (by name)"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i),
});

export const samsatIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

export const createSamsatSchema = Joi.object({
  name: Joi.string().max(200).required().label("Samsat Name"),
  description: Joi.string().allow(null, "").label("Description"),
  longitude: Joi.number().allow(null).label("Longitude"),
  latitude: Joi.number().allow(null).label("Latitude"),
});

export const updateSamsatSchema = Joi.object({
  name: Joi.string().max(200).label("Samsat Name"),
  description: Joi.string().allow(null, "").label("Description"),
  longitude: Joi.number().allow(null).label("Longitude"),
  latitude: Joi.number().allow(null).label("Latitude"),
}).min(1);
