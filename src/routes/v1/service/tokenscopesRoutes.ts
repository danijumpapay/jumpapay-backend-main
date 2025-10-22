import { Router } from "express";
import {
  findAllTokenScopes,
  findTokenScopeByKey,
  createTokenScope,
  deleteTokenScope,
} from "@controllers/service/tokenscopes";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllTokenScopesSchema,
  createTokenScopeSchema,
  deleteTokenScopeParamsSchema,
} from "@controllers/service/tokenscopes/tokenscopes.validation";

const router = Router();

router.get("/", validateQuery(findAllTokenScopesSchema), findAllTokenScopes);

router.get(
  "/:access_token_id/:api_scope_id",
  validateParams(deleteTokenScopeParamsSchema),
  findTokenScopeByKey
);

router.post("/", validateBody(createTokenScopeSchema), createTokenScope);

router.delete(
  "/:access_token_id/:api_scope_id",
  validateParams(deleteTokenScopeParamsSchema),
  deleteTokenScope
);

export default router;
