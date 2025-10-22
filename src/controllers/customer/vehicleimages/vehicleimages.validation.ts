import Joi from "joi";
import validate from "@middlewares/oldValidationMiddleware";

export const vehicleImagesSchema = validate(
  Joi.object({
    vehicleId: Joi.string().required(),
    originalImage: Joi.string().uri().allow(null, ""),
    image: Joi.string().uri().allow(null, ""),
  })
);
