import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const cityPlatesSchema = validate(
  Joi.object({
    city_id: Joi.number().required(),
    plate_id: Joi.number().required(),
    is_active: Joi.boolean(),
  })
);
