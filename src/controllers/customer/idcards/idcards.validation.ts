import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const idCardSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    nik: Joi.string().max(30).allow(null, ''),
    gender: Joi.string().uppercase().valid('MALE', 'FEMALE').allow(null, ''),
    job: Joi.string().max(200).allow(null, ''),
    bloodType: Joi.string().max(10).allow(null, ''),
    religion: Joi.string().max(100).allow(null, ''),
    image: Joi.string().allow(null, ''),
  })
);
