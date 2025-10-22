import Joi from "joi";

export const findAllOrderFormDatasSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  order_detail_id: Joi.string().max(200).label("Order Detail ID Filter"),
  form_token: Joi.string().max(200).label("Form Token Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withDetail: Joi.boolean().default(false),
});

export const orderFormDataIdSchema = Joi.object({
  id: Joi.string().uuid().required().label("Order Form Data ID (UUID)"),
});

export const createOrderFormDataSchema = Joi.object({
  order_detail_id: Joi.string().max(200).required().label("Order Detail ID"),
  form_token: Joi.string().max(200).required().label("Form Token"),
});

export const updateOrderFormDataSchema = Joi.object({
  form_token: Joi.string().max(200).label("Form Token"),
  form_data: Joi.object().unknown(true).label("Form Data (JSON)"),
})
  .min(1)
  .label("Update Order Form Data");
