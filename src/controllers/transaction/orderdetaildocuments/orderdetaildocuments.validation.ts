import Joi from "joi";

const documentTypes = ["STNK", "BPKB", "SKPD", "KTP", "OTHERS"] as const;

export const findAllOrderDetailDocumentsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  order_detail_id: Joi.string().max(200).label("Order Detail ID Filter"),
  uploaded_by: Joi.string().max(200).label("Uploaded By User ID Filter"),
  type: Joi.string()
    .valid(...documentTypes)
    .label("Document Type Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),

  withDetail: Joi.boolean().default(false),
  withUploader: Joi.boolean().default(false),
});

export const orderDetailDocumentIdSchema = Joi.object({
  id: Joi.string().uuid().required().label("Order Detail Document ID (UUID)"),
});

export const createOrderDetailDocumentSchema = Joi.object({
  order_detail_id: Joi.string().max(200).required().label("Order Detail ID"),
  uploaded_by: Joi.string().max(200).required().label("Uploaded By User ID"),
  type: Joi.string()
    .valid(...documentTypes)
    .required()
    .label("Document Type"),
  document: Joi.string().required().label("Document (URL or Base64 String)"),
});

export const updateOrderDetailDocumentSchema = Joi.object({
  type: Joi.string()
    .valid(...documentTypes)
    .label("Document Type"),
  document: Joi.string().label("Document (URL or Base64 String)"),
})
  .min(1)
  .label("Update Order Detail Document Data");
