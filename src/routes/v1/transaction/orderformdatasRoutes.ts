import { Router } from "express";
import {
  findAllOrderFormDatas,
  findOrderFormDataById,
  createOrderFormData,
  updateOrderFormData,
  deleteOrderFormData,
} from "@controllers/transaction/orderformdatas";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllOrderFormDatasSchema,
  orderFormDataIdSchema,
  createOrderFormDataSchema,
  updateOrderFormDataSchema,
} from "@controllers/transaction/orderformdatas/orderformdatas.validation";

const router = Router();

router.get("/", validateQuery(findAllOrderFormDatasSchema), findAllOrderFormDatas);
router.get("/:id", validateParams(orderFormDataIdSchema), findOrderFormDataById);
router.post("/", validateBody(createOrderFormDataSchema), createOrderFormData);
router.patch(
  "/:id",
  validateParams(orderFormDataIdSchema),
  validateBody(updateOrderFormDataSchema),
  updateOrderFormData
);
router.delete("/:id", validateParams(orderFormDataIdSchema), deleteOrderFormData);

export default router;
