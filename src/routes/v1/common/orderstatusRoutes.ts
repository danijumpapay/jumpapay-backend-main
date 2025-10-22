import { Router } from "express";
import {
  findAllOrderStatus,
  findOrderStatusById,
  createOrderStatus,
  updateOrderStatus,
  deleteOrderStatus,
} from "@controllers/common/orderstatus";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllOrderStatusSchema,
  orderStatusIdSchema,
  createOrderStatusSchema,
  updateOrderStatusSchema,
} from "@controllers/common/orderstatus/orderstatus.validation";

const router = Router();

router.get("/", validateQuery(findAllOrderStatusSchema), findAllOrderStatus);
router.get("/:id", validateParams(orderStatusIdSchema), findOrderStatusById);
router.post("/", validateBody(createOrderStatusSchema), createOrderStatus);
router.patch(
  "/:id",
  validateParams(orderStatusIdSchema),
  validateBody(updateOrderStatusSchema),
  updateOrderStatus
);
router.delete("/:id", validateParams(orderStatusIdSchema), deleteOrderStatus);

export default router;
