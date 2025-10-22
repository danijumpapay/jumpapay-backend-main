import { Router } from "express";
import {
  findAllServices,
  findServiceById,
  createService,
  updateService,
  deleteService,
} from "../../../controllers/service/services";
import {
  validateQuery,
  validateParams,
  validateBody,
} from "../../../middlewares/validationMiddleware";
import {
  findAllServicesSchema,
  serviceIdSchema,
  createServiceSchema,
  updateServiceSchema,
} from "../../../controllers/service/services/services.validation";

const router = Router();

router.get("/", validateQuery(findAllServicesSchema), findAllServices);
router.get("/:id", validateParams(serviceIdSchema), findServiceById);
router.post("/", validateBody(createServiceSchema), createService);
router.patch(
  "/:id",
  validateParams(serviceIdSchema),
  validateBody(updateServiceSchema),
  updateService
);
router.delete("/:id", validateParams(serviceIdSchema), deleteService);

export default router;
