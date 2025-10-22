import { Router } from "express";
import {
  findAllOrderAddresses,
  findOrderAddressById,
  createOrderAddress,
  updateOrderAddress,
  deleteOrderAddress,
} from "@controllers/transaction/orderaddresses";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllOrderAddressesSchema,
  orderAddressIdSchema,
  createOrderAddressSchema,
  updateOrderAddressSchema,
} from "@controllers/transaction/orderaddresses/orderaddresses.validation";

const router = Router();

router.get("/", validateQuery(findAllOrderAddressesSchema), findAllOrderAddresses);
router.get("/:id", validateParams(orderAddressIdSchema), findOrderAddressById);
router.post("/", validateBody(createOrderAddressSchema), createOrderAddress);
router.patch(
  "/:id",
  validateParams(orderAddressIdSchema),
  validateBody(updateOrderAddressSchema),
  updateOrderAddress
);
router.delete("/:id", validateParams(orderAddressIdSchema), deleteOrderAddress);

export default router;
