import Joi from "joi";

export const findAllOrderStatusSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  search: Joi.string().trim().allow("").label("Search (by name or alias)"),
  is_active: Joi.boolean().label("Is Active filter"),
  is_tag: Joi.boolean().label("Is Tag filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
});

export const orderStatusIdSchema = Joi.object({
  id: Joi.number().integer().required().label("Order Status ID"),
});

export const createOrderStatusSchema = Joi.object({
  name: Joi.string().max(150).required().label("Status Name"),
  alias: Joi.string().max(200).allow(null, "").label("Alias"),
  is_tag: Joi.boolean().default(false).label("Is Tag"),
  is_active: Joi.boolean().default(true).label("Is Active"),
});

export const updateOrderStatusSchema = Joi.object({
  name: Joi.string().max(150).label("Status Name"),
  alias: Joi.string().max(200).allow(null, "").label("Alias"),
  is_tag: Joi.boolean().label("Is Tag"),
  is_active: Joi.boolean().label("Is Active"),
})
  .min(1)
  .label("Update Order Status Data");
