import { Router } from "express";
import {
  findAllServicesForDashboard,
  findServiceBySlug,
} from "@controllers/service/servicesdashboard";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllServicesForDashboardSchema,
  serviceSlugSchema,
  createServiceSchema,
  updateServiceSchema,
} from "@controllers/service/servicesdashboard/servicesdashboard.validation";

const router = Router();

router.get("/", validateQuery(findAllServicesForDashboardSchema), findAllServicesForDashboard);
router.get("/:slug", validateParams(serviceSlugSchema), findServiceBySlug);

export default router;
