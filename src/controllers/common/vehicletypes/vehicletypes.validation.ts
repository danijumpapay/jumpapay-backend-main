import Joi from "joi";

export const findAllVehicleTypesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  search: Joi.string().trim().allow("").label("Search term (by name)"),
  is_active: Joi.boolean().label("Is Active filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
});

export const vehicleTypeIdSchema = Joi.object({
  id: Joi.number().integer().required().label("Vehicle Type ID"),
});

export const createVehicleTypeSchema = Joi.object({
  name: Joi.string().max(100).required().label("Vehicle Type Name"),
  is_active: Joi.boolean().default(true).label("Is Active"),
});

export const updateVehicleTypeSchema = Joi.object({
  name: Joi.string().max(100).label("Vehicle Type Name"),
  is_active: Joi.boolean().label("Is Active"),
})
  .min(1)
  .label("Update Vehicle Type Data");
