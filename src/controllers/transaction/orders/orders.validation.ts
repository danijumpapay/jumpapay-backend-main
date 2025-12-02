import Joi from "joi";

const orderTypes = ["INVOICING", "NON INVOICING"] as const;
const orderPositions = ["VERIFICATION", "SHOPPING BAG", "LIVE ORDER", "FINAL"] as const;

export const findAllOrdersSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  user_id: Joi.string().max(200).label("User ID Filter"),
  company_id: Joi.string().max(200).label("Company ID Filter"),
  order_status_id: Joi.number().integer().label("Order Status ID Filter"),
  booking_id: Joi.string().max(100).label("Booking ID Filter"),
  phone: Joi.string().max(30).label("Phone Number Filter"),
  city_id: Joi.number().integer().label("City ID Filter"),
  source: Joi.string().max(100).label("Source Filter"),
  status: Joi.string().max(100).label("Legacy Status Filter"),
  order_type: Joi.string()
    .valid(...orderTypes)
    .label("Order Type Filter"),
  order_position: Joi.string()
    .valid(...orderPositions)
    .label("Order Position Filter"),
  payment_type: Joi.string().max(200).label("Payment Type Filter"),
  paid_at_start: Joi.date().iso().label("Paid At Start Date (ISO)"),
  paid_at_end: Joi.date().iso().label("Paid At End Date (ISO)"),
  created_at_start: Joi.date().iso().label("Created At Start Date (ISO)"),
  created_at_end: Joi.date().iso().label("Created At End Date (ISO)"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withUser: Joi.boolean().default(false),
  withCompany: Joi.boolean().default(false),
  withStatus: Joi.boolean().default(false),
  withDetails: Joi.boolean().default(false),
  withAddresses: Joi.boolean().default(false),
  withNotes: Joi.boolean().default(false),
  withPayments: Joi.boolean().default(false),
});

export const findAllB2COrdersSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  user_id: Joi.string().max(200).label("User ID Filter"),
  company_id: Joi.string().max(200).label("Company ID Filter"),
  order_status_id: Joi.number().integer().label("Order Status ID Filter"),
  booking_id: Joi.string().max(100).label("Booking ID Filter"),
  phone: Joi.string().max(30).label("Phone Number Filter"),
  city_id: Joi.number().integer().label("City ID Filter"),
  source: Joi.string().max(100).label("Source Filter"),
  status: Joi.string().max(100).label("Legacy Status Filter"),
  payment_type: Joi.string().max(200).label("Payment Type Filter"),
  paid_at_start: Joi.date().iso().label("Paid At Start Date (ISO)"),
  paid_at_end: Joi.date().iso().label("Paid At End Date (ISO)"),
  created_at_start: Joi.date().iso().label("Created At Start Date (ISO)"),
  created_at_end: Joi.date().iso().label("Created At End Date (ISO)"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
});

export const orderIdSchema = Joi.object({
  id: Joi.string().max(200).required().label("Order ID"),
});

export const createOrderSchema = Joi.object({
  // user_id: Joi.string().max(200).allow(null).label("User ID"),
  name: Joi.string().max(200).required().label("Customer Name"),
  company_id: Joi.string().max(200).allow(null).label("Company ID"),
  // order_status_id: Joi.number().integer().required().label("Initial Order Status ID"),
  email: Joi.string().email().allow(null, "").label("Customer Email"),
  phone: Joi.string().max(30).allow(null, "").label("Customer Phone"),
  city_id: Joi.number().integer().allow(null).label("City ID"),
  source: Joi.string().max(100).allow(null, "").label("Order Source"),
  plate: Joi.string().max(100).allow(null, "").label("Plate Number"),
  vehicle_type_id: Joi.number().max(100).allow(null, "").label("Vehicle Type ID"),
  price: Joi.number().precision(2).positive().allow(0).label("Total Price (calculated?)"),
  order_type: Joi.string()
    .valid(...orderTypes)
    .allow(null)
    .label("Order Type"),
  order_position: Joi.string()
    .valid(...orderPositions)
    .allow(null)
    .label("Order Position"),
  payment_type: Joi.string().max(200).allow(null, "").label("Payment Type"),
});

export const updateOrderSchema = Joi.object({
  user_id: Joi.string().max(200).allow(null),
  company_id: Joi.string().max(200).allow(null),
  order_status_id: Joi.number().integer(),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().max(30).allow(null, ""),
  city_id: Joi.number().integer().allow(null),
  source: Joi.string().max(100).allow(null, ""),

  price: Joi.number().precision(2).positive().allow(0),
  order_type: Joi.string()
    .valid(...orderTypes)
    .allow(null),
  order_position: Joi.string()
    .valid(...orderPositions)
    .allow(null),
  payment_type: Joi.string().max(200).allow(null, ""),
  paid_at: Joi.date().iso().allow(null),
})
  .min(1)
  .label("Update Order Data");
