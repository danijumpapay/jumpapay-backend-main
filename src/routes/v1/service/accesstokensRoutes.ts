import { Router } from "express";
import {
  findAllAccessTokens,
  findAccessTokenById,
  createAccessToken,
  updateAccessToken,
  deleteAccessToken,
} from "@controllers/service/accesstokens";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllAccessTokensSchema,
  accessTokenIdSchema,
  createAccessTokenSchema,
  updateAccessTokenSchema,
} from "@controllers/service/accesstokens/accesstokens.validation";

const router = Router();

router.get("/", validateQuery(findAllAccessTokensSchema), findAllAccessTokens);
router.get("/:id", validateParams(accessTokenIdSchema), findAccessTokenById);
router.post("/", validateBody(createAccessTokenSchema), createAccessToken);
router.patch(
  "/:id",
  validateParams(accessTokenIdSchema),
  validateBody(updateAccessTokenSchema),
  updateAccessToken
);
router.delete("/:id", validateParams(accessTokenIdSchema), deleteAccessToken);

export default router;
