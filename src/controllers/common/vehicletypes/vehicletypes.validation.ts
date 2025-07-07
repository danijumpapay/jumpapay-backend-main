import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const vehicleTypesSchema = validate(
  Joi.object({
    id: Joi.number().required(),
    name: Joi.string().max(100).required(),
  })
);
