import Joi from "joi";

export const findAllServiceFormDocumentsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  service_id: Joi.number().integer().label("Service ID Filter"),
  whatsapp_form_id: Joi.string().max(200).label("WhatsApp Form ID Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
});

export const serviceFormDocumentIdSchema = Joi.object({
  id: Joi.number().integer().required().label("Service ID"),
});

export const createOrUpdateServiceFormDocumentSchema = Joi.object({
  whatsapp_form_id: Joi.string().max(200).required().label("WhatsApp Form ID"),
  whatsapp_form_name: Joi.string().max(200).required().label("WhatsApp Form Name"),
  whatsapp_form_token: Joi.string().max(200).required().label("WhatsApp Form Token"),
  whatsapp_form_screen: Joi.string().max(200).required().label("WhatsApp Form Screen"),
  whatsapp_form_cta: Joi.string().max(200).required().label("WhatsApp Form CTA"),
  message_after_form: Joi.string().allow(null, "").label("Message After Form"),
});
