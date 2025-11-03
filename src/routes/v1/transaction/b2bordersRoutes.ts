import { Router } from "express";
import {
  findAllB2BOrders,
} from "@controllers/transaction/orders";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  orderIdSchema,
  findAllB2COrdersSchema,
} from "@controllers/transaction/orders/orders.validation";

const router = Router();
router.get("/", validateQuery(findAllB2COrdersSchema), findAllB2BOrders);

export default router;


// THIS ROUTER IS NOT DONE YET
// I COULD SAY, IT'S ONLY EXAMPLE