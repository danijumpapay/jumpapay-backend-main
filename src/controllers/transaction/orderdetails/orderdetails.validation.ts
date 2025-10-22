import Joi from "joi";

export const findAllOrderDetailsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  order_id: Joi.string().max(200).label("Order ID Filter"),
  service_id: Joi.number().integer().label("Service ID Filter"),
  vehicle_id: Joi.string().max(200).label("Vehicle ID Filter"),
  samsat_id: Joi.number().integer().label("Samsat ID Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),

  withOrder: Joi.boolean().default(false),
  withService: Joi.boolean().default(false),
  withVehicle: Joi.boolean().default(false),
  withSamsat: Joi.boolean().default(false),
  withFees: Joi.boolean().default(false),
  withDocuments: Joi.boolean().default(false),
});

export const orderDetailIdSchema = Joi.object({
  id: Joi.string().max(200).required().label("Order Detail ID"),
});

export const createOrderDetailSchema = Joi.object({
  order_id: Joi.string().max(200).required().label("Order ID"),
  service_id: Joi.number().integer().required().label("Service ID"),
  vehicle_id: Joi.string().max(200).allow(null).label("Vehicle ID"),
  samsat_id: Joi.number().integer().allow(null).label("Samsat ID"),
  name: Joi.string().max(200).required().label("Detail Name (e.g., Service Name)"),
  price: Joi.number().precision(2).positive().allow(0).required().label("Detail Price"),

  plate_prefix: Joi.string().max(3).allow(null, "").label("Plate Prefix"),
  plate_number: Joi.string().max(10).allow(null, "").label("Plate Number"),
  plate_serial: Joi.string().max(10).allow(null, "").label("Plate Serial"),
  is_stnk_equals_ktp: Joi.boolean().allow(null).label("STNK matches KTP"),
  is_stnk_equals_bpkb: Joi.boolean().allow(null).label("STNK matches BPKB"),
  is_same_location: Joi.boolean().allow(null).label("Same Location"),
});

export const updateOrderDetailSchema = Joi.object({
  order_id: Joi.string().max(200).label("Order ID"),
  service_id: Joi.number().integer().label("Service ID"),
  vehicle_id: Joi.string().max(200).allow(null).label("Vehicle ID"),
  samsat_id: Joi.number().integer().allow(null).label("Samsat ID"),
  name: Joi.string().max(200).label("Detail Name"),
  price: Joi.number().precision(2).positive().allow(0).label("Detail Price"),
  plate_prefix: Joi.string().max(3).allow(null, "").label("Plate Prefix"),
  plate_number: Joi.string().max(10).allow(null, "").label("Plate Number"),
  plate_serial: Joi.string().max(10).allow(null, "").label("Plate Serial"),
  is_stnk_equals_ktp: Joi.boolean().allow(null).label("STNK matches KTP"),
  is_stnk_equals_bpkb: Joi.boolean().allow(null).label("STNK matches BPKB"),
  is_same_location: Joi.boolean().allow(null).label("Same Location"),
})
  .min(1)
  .label("Update Order Detail Data");
