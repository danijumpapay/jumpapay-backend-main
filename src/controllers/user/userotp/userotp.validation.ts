import Joi from "joi";
import validate from "@middlewares/oldValidationMiddleware";

export const userOtpSchema = validate(
  Joi.object({
    user_id: Joi.string().required(),
    name: Joi.string().max(100).allow(null, ""),
    code: Joi.string().allow(null, ""),
    expired_at: Joi.string().isoDate().allow(null, ""),
  })
);
