import { Router } from "express";
import {
  findAllOrders,
  findOrderById,
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

const router = Router();

router.get("/", validateQuery(findAllOrdersSchema), findAllOrders);
router.get("/:id", validateParams(orderIdSchema), findOrderById);
router.post("/", validateBody(createOrderSchema), createOrder);
router.patch("/:id", validateParams(orderIdSchema), validateBody(updateOrderSchema), updateOrder);
router.delete("/:id", validateParams(orderIdSchema), deleteOrder);

router.use("/:order_id/notes", ordernotesRoutes);
router.use("/:order_id/evidence", courierevidencesRoutes);

export default router;
