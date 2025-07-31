import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const vehicleImagesSchema = validate(
  Joi.object({
    vehicleId: Joi.string().required(),
    originalImage: Joi.string().uri().allow(null, ''),
    image: Joi.string().uri().allow(null, '')
  })
);
