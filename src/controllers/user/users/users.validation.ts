import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const usersSchema = validate(
  Joi.object({
    name: Joi.string().min(3).max(200).required(),
    alias: Joi.string().max(50).allow(null, ''),
    username: Joi.string().min(3).max(100).allow(null, ''),
    phone: Joi.string().min(7).max(30).required(),
    password: Joi.string().min(6).required(),
    avatar: Joi.string().uri().allow(null, ''),
    about: Joi.string().allow(null, ''),
    role: Joi.string().uppercase().valid("GOD", "SUPERUSER", "ADMIN", "VIP", "CUSTOMER"),
    is_reviewer: Joi.boolean(),
    is_active: Joi.boolean(),
    is_multi_device: Joi.boolean(),
    verified_at: Joi.string().isoDate().allow(null, '')
  })
);
