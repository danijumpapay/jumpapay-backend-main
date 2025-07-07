import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const vehiclesSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    vehicleTypeId: Joi.number().required(),
    plateId: Joi.number().required(),
    plateNumber: Joi.string().max(10).allow(null, ''),
    plateSerial: Joi.string().max(10).allow(null, ''),
    brand: Joi.string().max(200).allow(null, ''),
    model: Joi.string().max(200).allow(null, ''),
    yearOfManufacture: Joi.number().allow(null),
    color: Joi.string().max(100).allow(null, ''),
    engineNumber: Joi.string().max(200).allow(null, ''),
    chassisNumber: Joi.string().max(200).allow(null, '')
  })
);
