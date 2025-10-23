import { Router } from "express";
import {
  findAllServicesForDashboard,
  findServiceById,
  createService,
  updateService,
  deleteService,
} from "@controllers/service/servicesdashboard";
import {
  validateQuery,
  validateParams,
  validateBody,
} from "@middlewares/validationMiddleware";
import {
  findAllServicesForDashboardSchema,
  serviceSlugSchema,
  createServiceSchema,
  updateServiceSchema,
} from "@controllers/service/servicesdashboard/servicesdashboard.validation";

const router = Router();

router.get("/", validateQuery(findAllServicesForDashboardSchema), findAllServicesForDashboard);
router.get("/:slug", validateParams(serviceSlugSchema), findServiceById);
router.post("/", validateBody(createServiceSchema), createService);
router.patch(
  "/:id",
  validateParams(serviceSlugSchema),
  validateBody(updateServiceSchema),
  updateService
);

export default router;
