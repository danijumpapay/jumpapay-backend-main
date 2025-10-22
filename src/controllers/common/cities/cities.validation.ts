import Joi from "joi";

export const findAllCitiesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  search: Joi.string().trim().allow("").label("Search term"),
  province_id: Joi.number().integer().empty("").allow(null).label("Province ID"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withProvince: Joi.boolean().default(false).label("Include Province Data"),
  withCityPlates: Joi.boolean().default(false).label("Include City Plates Data"),
});

export const cityIdSchema = Joi.object({
  id: Joi.number().integer().required().label("City ID"),
});

export const createCitySchema = Joi.object({
  province_id: Joi.number().integer().required().label("Province ID"),
  name: Joi.string().max(200).required().label("City Name"),
  icon: Joi.string().allow(null, "").label("Icon URL"),
});

export const updateCitySchema = Joi.object({
  province_id: Joi.number().integer().label("Province ID"),
  name: Joi.string().max(200).label("City Name"),
  icon: Joi.string().allow(null, "").label("Icon URL"),
})
  .min(1)
  .label("Update City Data");
