import Joi from "joi";

export const findAllOrderDetailFeesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  order_detail_id: Joi.string().max(200).label("Order Detail ID Filter"),
  jumpapay_fee_id: Joi.number().integer().empty("").allow(null).label("Jumpapay Fee ID Filter"),
  order_fee_name: Joi.number()
    .integer()
    .empty("")
    .allow(null)
    .label("Order Fee Name (Code) Filter"),
  order_fee_group: Joi.number()
    .integer()
    .empty("")
    .allow(null)
    .label("Order Fee Group (Code) Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),

  withDetail: Joi.boolean().default(false),
  withJumpapayFee: Joi.boolean().default(false),
});

export const orderDetailFeeIdSchema = Joi.object({
  id: Joi.string().uuid().required().label("Order Detail Fee ID (UUID)"),
});

export const createOrderDetailFeeSchema = Joi.object({
  order_detail_id: Joi.string().max(200).required().label("Order Detail ID"),
  jumpapay_fee_id: Joi.number().integer().required().label("Jumpapay Fee ID"),
  order_fee_name: Joi.number().integer().min(0).max(9999).required().label("Order Fee Name (Code)"),
  order_fee_group: Joi.number()
    .integer()
    .min(0)
    .max(9999)
    .required()
    .label("Order Fee Group (Code)"),
  fee_name: Joi.string().max(200).required().label("Fee Name (Snapshot)"),
  fee_group_name: Joi.string().max(200).required().label("Fee Group Name (Snapshot)"),
  value: Joi.number().precision(2).positive().allow(0).required().label("Fee Value"),
});

export const updateOrderDetailFeeSchema = Joi.object({
  order_fee_name: Joi.number().integer().min(0).max(9999).label("Order Fee Name (Code)"),
  order_fee_group: Joi.number().integer().min(0).max(9999).label("Order Fee Group (Code)"),
  fee_name: Joi.string().max(200).label("Fee Name (Snapshot)"),
  fee_group_name: Joi.string().max(200).label("Fee Group Name (Snapshot)"),
  value: Joi.number().precision(2).positive().allow(0).label("Fee Value"),
})
  .min(1)
  .label("Update Order Detail Fee Data");
