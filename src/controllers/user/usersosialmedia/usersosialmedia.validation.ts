import Joi from "joi";
import validate from "../../../middlewares/validationMiddleware";

export const userSosialMediaSchema = validate(
  Joi.object({
    user_id: Joi.string().required(),
    sosial: Joi.string().valid("INSTAGRAM", "LINKEDIN", "FACEBOOK", "GITHUB"),
    link: Joi.string().uri().required()
  })
);
