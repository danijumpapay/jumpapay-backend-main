import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const orderAddressesSchema = validate(
  Joi.object({
    orderId: Joi.string().required(),
    addressId: Joi.string().required(),
    price: Joi.number().required(),
    type: Joi.string().valid("RETURN", "PICKUP").required()
  })
);
