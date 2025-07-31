import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const companyWhatsappSchema = validate(
  Joi.object({
    companyId: Joi.string().required(),
    phoneId: Joi.string().allow(null, ''),
    wabId: Joi.string().allow(null, ''),
    phone: Joi.string().max(50).allow(null, ''),
    name: Joi.string().max(50).allow(null, ''),
    avatar: Joi.string().allow(null, ''),
    address: Joi.string().max(250).allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    website: Joi.string().max(250).allow(null, ''),
    description: Joi.string().allow(null, ''),
    accessToken: Joi.string().allow(null, ''),
    webhook: Joi.string().allow(null, ''),
    webhookToken: Joi.string().allow(null, ''),
    isActive: Joi.boolean().default(false)
  })
);
