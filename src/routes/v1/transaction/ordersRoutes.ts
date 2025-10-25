import { Router } from "express";
import {
  findAllOrders,
  findOrderById,
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
  findAllOrdersSchema,
  orderIdSchema,
  createOrderSchema,
  updateOrderSchema,
  findAllB2COrdersSchema,
} from "@controllers/transaction/orders/orders.validation";
import ordernotesRoutes from "./ordernotesRoutes";
import courierevidencesRoutes from "./courierevidencesRoutes";

const router = Router();

router.get("/", validateQuery(findAllOrdersSchema), findAllOrders);

router.get("/b2c", validateQuery(findAllB2COrdersSchema), findAllB2COrders);
router.get("/b2c/unpaid", validateQuery(findAllB2COrdersSchema), findAllB2CUnpaidOrders);
router.get("/b2c/paid", validateQuery(findAllB2COrdersSchema), findAllB2CPaidOrders);
router.get("/b2c/completed", validateQuery(findAllB2COrdersSchema), findAllB2CCompletedOrders);

router.get("/b2b", validateQuery(findAllOrdersSchema), findAllB2BOrders);

router.get("/:id", validateParams(orderIdSchema), findOrderById);
router.post("/", validateBody(createOrderSchema), createOrder);
router.patch("/:id", validateParams(orderIdSchema), validateBody(updateOrderSchema), updateOrder);
router.delete("/:id", validateParams(orderIdSchema), deleteOrder);

router.use("/:order_id/notes", ordernotesRoutes);
router.use("/:order_id/evidence", courierevidencesRoutes);

export default router;
