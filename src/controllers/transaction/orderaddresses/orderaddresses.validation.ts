import Joi from "joi";

const deliveryTypes = ["RETURN", "PICKUP"] as const;
const addressStatuses = ["WAITING FOR DRIVER", "ON THE WAY", "COMPLETED"] as const;

export const findAllOrderAddressesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  order_id: Joi.string().max(200).label("Order ID Filter"),
  user_id: Joi.string().max(200).label("User ID Filter"),
  address_id: Joi.string().max(200).label("Customer Address ID Filter"),
  delivery_type: Joi.string()
    .valid(...deliveryTypes)
    .label("Delivery Type Filter"),
  status: Joi.string()
    .valid(...addressStatuses)
    .label("Status Filter"),
  scheduled_date: Joi.date().iso().label("Scheduled Date Filter (ISO)"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),

  withOrder: Joi.boolean().default(false),
  withUser: Joi.boolean().default(false),
  withAddress: Joi.boolean().default(false),
});

export const orderAddressIdSchema = Joi.object({
  id: Joi.string().uuid().required().label("Order Address ID (UUID)"),
});

export const createOrderAddressSchema = Joi.object({
  order_id: Joi.string().max(200).required().label("Order ID"),
  address_id: Joi.string().max(200).allow(null).label("Customer Address ID (Optional)"),
  user_id: Joi.string().max(200).allow(null).label("User ID (Optional)"),

  city_name: Joi.string().max(200).allow(null, "").label("City Name"),
  province_name: Joi.string().max(200).allow(null, "").label("Province Name"),
  raw_address: Joi.string().allow(null, "").label("Raw Address"),
  longitude: Joi.number().allow(null).label("Longitude"),
  latitude: Joi.number().allow(null).label("Latitude"),
  landmark: Joi.string().max(150).allow(null, "").label("Landmark"),

  price: Joi.number().precision(2).positive().allow(0).allow(null).label("Delivery Price"),
  scheduled_date: Joi.date().iso().allow(null).label("Scheduled Date (ISO 8601)"),
  status: Joi.string()
    .valid(...addressStatuses)
    .required()
    .label("Initial Status"),
  delivery_type: Joi.string()
    .valid(...deliveryTypes)
    .required()
    .label("Delivery Type"),
});

export const updateOrderAddressSchema = Joi.object({
  city_name: Joi.string().max(200).allow(null, ""),
  province_name: Joi.string().max(200).allow(null, ""),
  raw_address: Joi.string().allow(null, ""),
  longitude: Joi.number().allow(null),
  latitude: Joi.number().allow(null),
  landmark: Joi.string().max(150).allow(null, ""),
  price: Joi.number().precision(2).positive().allow(0).allow(null),
  scheduled_date: Joi.date().iso().allow(null),
  status: Joi.string().valid(...addressStatuses),
  delivery_type: Joi.string().valid(...deliveryTypes),
})
  .min(1)
  .label("Update Order Address Data");
