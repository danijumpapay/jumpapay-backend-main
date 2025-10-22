import Joi from "joi";
import validate from "@middlewares/oldValidationMiddleware";

export const companiesSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().max(200).allow(null, ""),
    description: Joi.string().max(200).allow(null, ""),
    pic: Joi.string().max(150).allow(null, ""),
    logo: Joi.string().allow(null, ""),
    longitude: Joi.number().allow(null),
    latitude: Joi.number().allow(null),
    address: Joi.string().allow(null, ""),
    email: Joi.string().email().allow(null, ""),
  })
);
