import { Router } from "express";
import {
  findAllServiceFormOrders,
  findServiceFormOrderById,
  upsertServiceFormOrder,
  deleteServiceFormOrder,
} from "@controllers/service/serviceformorders";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllServiceFormOrdersSchema,
  serviceFormOrderIdSchema,
  createOrUpdateServiceFormOrderSchema,
} from "@controllers/service/serviceformorders/serviceformorders.validation";

const router = Router();

router.get("/", validateQuery(findAllServiceFormOrdersSchema), findAllServiceFormOrders);

router.get("/:id", validateParams(serviceFormOrderIdSchema), findServiceFormOrderById);

router.put(
  "/:id",
  validateParams(serviceFormOrderIdSchema),
  validateBody(createOrUpdateServiceFormOrderSchema),
  upsertServiceFormOrder
);

router.delete("/:id", validateParams(serviceFormOrderIdSchema), deleteServiceFormOrder);

export default router;
