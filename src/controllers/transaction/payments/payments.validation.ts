import Joi from "joi";

const paymentStatuses = ["PENDING", "PAID", "FAILED", "CANCELLED", "EXPIRED"] as const;

export const findAllPaymentsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  company_id: Joi.string().max(200).label("Company ID Filter"),
  invoice_number: Joi.string().max(200).label("Invoice Number Filter"),
  payment_gateway_ref: Joi.string().label("Payment Gateway Ref Filter"),
  status: Joi.string()
    .valid(...paymentStatuses)
    .label("Payment Status Filter"),
  payment_method_type: Joi.string().max(200).label("Payment Method Type Filter"),
  paid_at_start: Joi.date().iso().label("Paid At Start Date (ISO)"),
  paid_at_end: Joi.date().iso().label("Paid At End Date (ISO)"),
  created_at_start: Joi.date().iso().label("Created At Start Date (ISO)"),
  created_at_end: Joi.date().iso().label("Created At End Date (ISO)"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .default("created_at:desc")
    .label("Sort (column:direction)"),

  withCompany: Joi.boolean().default(false),
  withItems: Joi.boolean().default(false),
  withItemsOrder: Joi.boolean().default(false),
});

export const paymentIdSchema = Joi.object({
  id: Joi.string().max(200).required().label("Payment ID"),
});

export const createPaymentSchema = Joi.object({
  company_id: Joi.string().max(200).allow(null).label("Company ID"),
  payment_gateway_ref: Joi.string().allow(null, "").label("Payment Gateway Ref"),
  invoice_number: Joi.string().max(200).required().label("Invoice Number"),
  amount: Joi.number().precision(2).positive().required().label("Amount"),
  payment_method_name: Joi.string().max(200).allow(null, "").label("Payment Method Name"),
  payment_method_type: Joi.string().max(200).allow(null, "").label("Payment Method Type"),
  status: Joi.string()
    .valid(...paymentStatuses)
    .default("PENDING")
    .label("Initial Status"),
  paid_at: Joi.date().iso().allow(null).label("Paid At (ISO 8601)"),
  expired_at: Joi.date().iso().allow(null).label("Expires At (ISO 8601)"),
  payment_details: Joi.object().unknown(true).allow(null).label("Payment Details (JSONB)"),

  order_ids: Joi.array().items(Joi.string().max(200)).min(1).required().label("Order IDs"),
});

export const updatePaymentSchema = Joi.object({
  payment_gateway_ref: Joi.string().allow(null, "").label("Payment Gateway Ref"),
  status: Joi.string()
    .valid(...paymentStatuses)
    .label("New Status"),
  paid_at: Joi.date().iso().allow(null).label("Paid At (ISO 8601)"),
  expired_at: Joi.date().iso().allow(null).label("Expires At (ISO 8601)"),
  payment_details: Joi.object().unknown(true).allow(null).label("Payment Details (JSONB)"),
})
  .min(1)
  .label("Update Payment Data");
