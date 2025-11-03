import { Router } from "express";
import {
  findAllOrders,
  findB2COrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  findAllB2COrders,
  findAllB2BOrders,
  findAllB2CUnpaidOrders,
  findAllB2CPaidOrders,
  findAllB2CCompletedOrders,
} from "@controllers/transaction/orders";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  orderIdSchema,
  findAllB2COrdersSchema,
} from "@controllers/transaction/orders/orders.validation";

const router = Router();

router.get("/", validateQuery(findAllB2COrdersSchema), findAllB2COrders);
router.get("/unpaid", validateQuery(findAllB2COrdersSchema), findAllB2CUnpaidOrders);
router.get("/paid", validateQuery(findAllB2COrdersSchema), findAllB2CPaidOrders);
router.get("/completed", validateQuery(findAllB2COrdersSchema), findAllB2CCompletedOrders);
router.get("/:id", validateParams(orderIdSchema), findB2COrderById);

export default router;
