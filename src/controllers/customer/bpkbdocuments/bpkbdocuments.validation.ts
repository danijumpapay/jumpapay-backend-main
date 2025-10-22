import Joi from "joi";
import validate from "@middlewares/oldValidationMiddleware";

export const bpkbDocumentsSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    vehicleId: Joi.string().required(),
    bpkbNumber: Joi.string().max(100).required(),
    issueDate: Joi.string().isoDate().allow(null, ""),
    registrationOffice: Joi.string().max(100).allow(null, ""),
    image: Joi.string().uri().allow(null, ""),
    isActive: Joi.boolean(),
  })
);
