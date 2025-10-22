import Joi from "joi";
import validate from "@middlewares/oldValidationMiddleware";

export const userEmailsSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    email: Joi.string().email().required(),
    is_primary: Joi.boolean(),
    verified_at: Joi.string().isoDate().allow(null, ""),
  })
);
