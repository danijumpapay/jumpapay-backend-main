import { Router } from "express";
import {
  findAllPaymentMethods,
  findPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "@controllers/common/paymentmethods";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllPaymentMethodsSchema,
  paymentMethodIdSchema,
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "@controllers/common/paymentmethods/paymentmethods.validation";

const router = Router();

router.get("/", validateQuery(findAllPaymentMethodsSchema), findAllPaymentMethods);
router.get("/:id", validateParams(paymentMethodIdSchema), findPaymentMethodById);
router.post("/", validateBody(createPaymentMethodSchema), createPaymentMethod);
router.patch(
  "/:id",
  validateParams(paymentMethodIdSchema),
  validateBody(updatePaymentMethodSchema),
  updatePaymentMethod
);
router.delete("/:id", validateParams(paymentMethodIdSchema), deletePaymentMethod);

export default router;
