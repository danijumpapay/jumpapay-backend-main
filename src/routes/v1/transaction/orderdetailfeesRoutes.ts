import { Router } from "express";
import {
  findAllOrderDetailFees,
  findOrderDetailFeeById,
  createOrderDetailFee,
  updateOrderDetailFee,
  deleteOrderDetailFee,
} from "@controllers/transaction/orderdetailfees";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllOrderDetailFeesSchema,
  orderDetailFeeIdSchema,
  createOrderDetailFeeSchema,
  updateOrderDetailFeeSchema,
} from "@controllers/transaction/orderdetailfees/orderdetailfees.validation";

const router = Router();

router.get("/", validateQuery(findAllOrderDetailFeesSchema), findAllOrderDetailFees);
router.get("/:id", validateParams(orderDetailFeeIdSchema), findOrderDetailFeeById);
router.post("/", validateBody(createOrderDetailFeeSchema), createOrderDetailFee);
router.patch(
  "/:id",
  validateParams(orderDetailFeeIdSchema),
  validateBody(updateOrderDetailFeeSchema),
  updateOrderDetailFee
);
router.delete("/:id", validateParams(orderDetailFeeIdSchema), deleteOrderDetailFee);

export default router;
