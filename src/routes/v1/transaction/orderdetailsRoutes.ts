import { Router } from "express";
import {
  findAllOrderDetails,
  findOrderDetailById,
  createOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
} from "@controllers/transaction/orderdetails";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllOrderDetailsSchema,
  orderDetailIdSchema,
  createOrderDetailSchema,
  updateOrderDetailSchema,
} from "@controllers/transaction/orderdetails/orderdetails.validation";

const router = Router();

router.get("/", validateQuery(findAllOrderDetailsSchema), findAllOrderDetails);
router.get("/:id", validateParams(orderDetailIdSchema), findOrderDetailById);
router.post("/", validateBody(createOrderDetailSchema), createOrderDetail);
router.patch(
  "/:id",
  validateParams(orderDetailIdSchema),
  validateBody(updateOrderDetailSchema),
  updateOrderDetail
);
router.delete("/:id", validateParams(orderDetailIdSchema), deleteOrderDetail);

export default router;
