import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const citiesSchema = validate(
  Joi.object({
    id: Joi.number().required(),
    name: Joi.string().max(200).required(),
    icon: Joi.string().allow(null, ''),
  })
);
