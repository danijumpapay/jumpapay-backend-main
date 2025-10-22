import Joi from "joi";

export const findAllOrderNotesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  order_id: Joi.string().max(200).required().label("Order ID Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .default("created_at:desc")
    .label("Sort (column:direction)"),
  withOrder: Joi.boolean().default(false),
});

export const orderNoteIdSchema = Joi.object({
  id: Joi.string().uuid().required().label("Order Note ID (UUID)"),
  order_id: Joi.string().max(200).required().label("Order ID"),
});

export const createOrderNoteSchema = Joi.object({
  note: Joi.string().required().label("Note Content"),
  created_by: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().required(),
  })
    .unknown(true)
    .required()
    .label("Created By (User Snapshot)"),
});

export const updateOrderNoteSchema = Joi.object({
  note: Joi.string().label("Note Content"),
})
  .min(1)
  .label("Update Order Note Data");
