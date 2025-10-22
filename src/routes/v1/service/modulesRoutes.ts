import { Router } from "express";
import {
  createModule,
  deleteModule,
  findAllModules,
  findModuleById,
  updateModule,
} from "@controllers/service/modules";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  createModuleSchema,
  findAllModulesSchema,
  moduleIdSchema,
  updateModuleSchema,
} from "@controllers/service/modules/modules.validation";

const router = Router();

router.get("/", validateQuery(findAllModulesSchema), findAllModules);
router.get("/:id", validateParams(moduleIdSchema), findModuleById);
router.post("/", validateBody(createModuleSchema), createModule);
router.patch(
  "/:id",
  validateParams(moduleIdSchema),
  validateBody(updateModuleSchema),
  updateModule
);
router.delete("/:id", validateParams(moduleIdSchema), deleteModule);

export default router;
