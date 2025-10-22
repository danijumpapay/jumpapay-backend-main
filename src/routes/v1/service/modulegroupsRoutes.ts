import { Router } from "express";
import {
  findAllModuleGroups,
  findModuleGroupById,
  createModuleGroup,
  updateModuleGroup,
  deleteModuleGroup,
} from "@controllers/service/modulegroups";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllModuleGroupsSchema,
  moduleGroupIdSchema,
  createModuleGroupSchema,
  updateModuleGroupSchema,
} from "@controllers/service/modulegroups/modulegroups.validation";

const router = Router();

router.get("/", validateQuery(findAllModuleGroupsSchema), findAllModuleGroups);
router.get("/:id", validateParams(moduleGroupIdSchema), findModuleGroupById);
router.post("/", validateBody(createModuleGroupSchema), createModuleGroup);
router.patch(
  "/:id",
  validateParams(moduleGroupIdSchema),
  validateBody(updateModuleGroupSchema),
  updateModuleGroup
);
router.delete("/:id", validateParams(moduleGroupIdSchema), deleteModuleGroup);

export default router;
