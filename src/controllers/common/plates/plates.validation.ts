import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const platesSchema = validate(
  Joi.object({
    id: Joi.number().required(),
    name: Joi.string().max(5).allow(null, ''),
    icon: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    isActive: Joi.boolean().default(true),
  })
);
