import { Router } from "express";
import {
  findAllPayments,
  findPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "@controllers/transaction/payments";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllPaymentsSchema,
  paymentIdSchema,
  createPaymentSchema,
  updatePaymentSchema,
} from "@controllers/transaction/payments/payments.validation";

const router = Router();

router.get("/", validateQuery(findAllPaymentsSchema), findAllPayments);
router.get("/:id", validateParams(paymentIdSchema), findPaymentById);
router.post("/", validateBody(createPaymentSchema), createPayment);
router.patch(
  "/:id",
  validateParams(paymentIdSchema),
  validateBody(updatePaymentSchema),
  updatePayment
);
router.delete("/:id", validateParams(paymentIdSchema), deletePayment);

export default router;
