import Joi from "joi";
import validate from "@middlewares/oldValidationMiddleware";

export const stnkDocumentsSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    vehicleId: Joi.string().required(),
    stnkNumber: Joi.string().max(100).required(),
    issueDate: Joi.string().isoDate().allow(null, ""),
    expiryDate: Joi.string().isoDate().allow(null, ""),
    taxDueDate: Joi.string().isoDate().allow(null, ""),
    isActive: Joi.boolean(),
    image: Joi.string().uri().allow(null, ""),
  })
);
