import Joi from "joi";
import validate from "@middlewares/oldValidationMiddleware";

export const companyEmployeesSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    companyId: Joi.string().required(),
    role: Joi.string().uppercase().valid("ADMIN", "CS", "SUPERVISOR").required(),
  })
);
