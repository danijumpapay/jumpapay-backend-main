import Joi from "joi";

export const findAllPlatesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  search: Joi.string().trim().allow("").label("Search term (by name)"),
  is_active: Joi.boolean().label("Is Active filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withCities: Joi.boolean().default(false).label("Include associated Cities"),
});

export const plateIdSchema = Joi.object({
  id: Joi.number().integer().required().label("Plate ID"),
});

export const createPlateSchema = Joi.object({
  name: Joi.string().max(5).required().label("Plate Name (e.g., B)"),
  icon: Joi.string().allow(null, "").label("Icon URL"),
  description: Joi.string().allow(null, "").label("Description"),
  is_active: Joi.boolean().default(true).label("Is Active"),
});

export const updatePlateSchema = Joi.object({
  name: Joi.string().max(5).label("Plate Name (e.g., B)"),
  icon: Joi.string().allow(null, "").label("Icon URL"),
  description: Joi.string().allow(null, "").label("Description"),
  is_active: Joi.boolean().label("Is Active"),
})
  .min(1)
  .label("Update Plate Data");
