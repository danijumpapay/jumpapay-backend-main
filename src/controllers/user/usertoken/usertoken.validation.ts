import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const userTokenSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().max(100).allow(null, ''),
    device: Joi.string().max(150).allow(null, ''),
    browser: Joi.string().max(100).allow(null, ''),
    ip: Joi.string().max(100).allow(null, ''),
    location: Joi.string().max(150).allow(null, ''),
    token: Joi.string().allow(null, ''),
    expiredAt: Joi.string().allow(null, ''),
    isExpired: Joi.boolean().required()
  })
);
