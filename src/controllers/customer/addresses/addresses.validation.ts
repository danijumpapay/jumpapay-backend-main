import Joi from "joi";
import validate from "@middlewares/oldValidationMiddleware";

export const addressesSchema = validate(
  Joi.object({
    userId: Joi.string().max(200).required(),
    cityId: Joi.number().required(),
    name: Joi.string().max(150).required(),
    addressType: Joi.string()
      .uppercase()
      .valid("HOUSE", "OFFICE", "APARTMENT", "BOARDING_HOUSE")
      .allow(null, ""),
    province: Joi.string().max(100).allow(null, ""),
    rawAddress: Joi.string().allow(null, ""),
    longitude: Joi.number().allow(null),
    latitude: Joi.number().allow(null),
    postcode: Joi.string().max(10).allow(null, ""),
    isPickupAddress: Joi.boolean().default(false),
    isReturnAddress: Joi.boolean().default(false),
  })
);
