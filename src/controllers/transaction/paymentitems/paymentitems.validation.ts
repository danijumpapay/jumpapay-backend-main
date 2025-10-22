import Joi from "joi";

export const findAllPaymentItemsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  payment_id: Joi.string().max(200).label("Payment ID Filter"),
  order_id: Joi.string().max(200).label("Order ID Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withPayment: Joi.boolean().default(false),
  withOrder: Joi.boolean().default(false),
});

export const createPaymentItemSchema = Joi.object({
  payment_id: Joi.string().max(200).required().label("Payment ID"),
  order_id: Joi.string().max(200).required().label("Order ID"),
});

export const deletePaymentItemParamsSchema = Joi.object({
  payment_id: Joi.string().max(200).required().label("Payment ID"),
  order_id: Joi.string().max(200).required().label("Order ID"),
});
