import Joi from "joi";

const deliveryTypes = ["RETURN", "PICKUP"] as const;

export const findAllCourierEvidencesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  order_id: Joi.string().max(200).required().label("Order ID Filter"),
  user_id: Joi.string().max(200).label("User ID Filter (Courier)"),
  delivery_type: Joi.string()
    .valid(...deliveryTypes)
    .label("Delivery Type Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .default("created_at:desc")
    .label("Sort (column:direction)"),

  withOrder: Joi.boolean().default(false),
  withUser: Joi.boolean().default(false),
});

export const courierEvidenceIdSchema = Joi.object({
  id: Joi.string().uuid().required().label("Courier Evidence ID (UUID)"),

  order_id: Joi.string().max(200).label("Order ID (from route)"),
});

export const createCourierEvidenceSchema = Joi.object({
  order_id: Joi.string().max(200).required().label("Order ID"),
  user_id: Joi.string().max(200).required().label("User ID (Courier)"),
  delivery_type: Joi.string()
    .valid(...deliveryTypes)
    .required()
    .label("Delivery Type"),
});

export const updateCourierEvidenceSchema = Joi.object({
  delivery_type: Joi.string()
    .valid(...deliveryTypes)
    .label("Delivery Type"),
})
  .min(1)
  .label("Update Courier Evidence Data");
