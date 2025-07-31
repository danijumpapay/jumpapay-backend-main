import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const ordersSchema = validate(
  Joi.object({
    userId: Joi.string().allow(null, ''),
    bookingId: Joi.string().max(100).required(),
    phone: Joi.string().min(7).max(30).required(),
    cityId: Joi.number().required(),
    source: Joi.string().max(100).required(),
    paidAt: Joi.string().isoDate().allow(null, ''),
    paymentType: Joi.string().max(200).required()
  })
);
