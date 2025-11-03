import { Router } from "express";
import {
  findAllOrders,
  findB2COrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "@controllers/transaction/orders";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllOrdersSchema,
  orderIdSchema,
  createOrderSchema,
  updateOrderSchema,
} from "@controllers/transaction/orders/orders.validation";
import ordernotesRoutes from "./ordernotesRoutes";
import courierevidencesRoutes from "./courierevidencesRoutes";
import b2cordersRoutes from "./b2cordersRoutes";
import b2bordersRoutes from "./b2bordersRoutes";

const router = Router();

router.use("/b2c", b2cordersRoutes);
router.use("/b2b", b2bordersRoutes);

router.get("/", validateQuery(findAllOrdersSchema), findAllOrders);
router.get("/:id", validateParams(orderIdSchema), findB2COrderById);
router.post("/", validateBody(createOrderSchema), createOrder);
router.patch("/:id", validateParams(orderIdSchema), validateBody(updateOrderSchema), updateOrder);
router.delete("/:id", validateParams(orderIdSchema), deleteOrder);

router.use("/:order_id/notes", ordernotesRoutes);
router.use("/:order_id/evidence", courierevidencesRoutes);

export default router;
