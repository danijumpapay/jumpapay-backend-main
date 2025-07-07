import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const usersActivitiesSchema = validate(
  Joi.object({
    userId: Joi.string().required(),
    activityName: Joi.string().max(150).required(),
    activityDetail: Joi.string().allow(null, "")
  })
);
