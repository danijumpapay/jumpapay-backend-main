import { Router } from "express";
import {
  findAllPaymentItems,
  findPaymentItemByKey,
  createPaymentItem,
  deletePaymentItem,
} from "@controllers/transaction/paymentitems";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllPaymentItemsSchema,
  createPaymentItemSchema,
  deletePaymentItemParamsSchema,
} from "@controllers/transaction/paymentitems/paymentitems.validation";

const router = Router();

router.get("/", validateQuery(findAllPaymentItemsSchema), findAllPaymentItems);

router.get(
  "/:payment_id/:order_id",
  validateParams(deletePaymentItemParamsSchema),
  findPaymentItemByKey
);

router.post("/", validateBody(createPaymentItemSchema), createPaymentItem);

router.delete(
  "/:payment_id/:order_id",
  validateParams(deletePaymentItemParamsSchema),
  deletePaymentItem
);

export default router;
