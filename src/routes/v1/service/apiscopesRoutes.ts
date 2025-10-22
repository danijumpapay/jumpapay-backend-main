import { Router } from "express";
import {
  findAllApiScopes,
  findApiScopeById,
  createApiScope,
  updateApiScope,
  deleteApiScope,
} from "@controllers/service/apiscopes";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllApiScopesSchema,
  apiScopeIdSchema,
  createApiScopeSchema,
  updateApiScopeSchema,
} from "@controllers/service/apiscopes/apiscopes.validation";

const router = Router();

router.get("/", validateQuery(findAllApiScopesSchema), findAllApiScopes);
router.get("/:id", validateParams(apiScopeIdSchema), findApiScopeById);
router.post("/", validateBody(createApiScopeSchema), createApiScope);
router.patch(
  "/:id",
  validateParams(apiScopeIdSchema),
  validateBody(updateApiScopeSchema),
  updateApiScope
);
router.delete("/:id", validateParams(apiScopeIdSchema), deleteApiScope);

export default router;
