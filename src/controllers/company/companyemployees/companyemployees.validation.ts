import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const companyEmployeesSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    companyId: Joi.string().required(),
    role: Joi.string().uppercase().valid("ADMIN", "CS", "SUPERVISOR").required()
  })
);
