import { Router } from "express";
import {
  findAllOrderNotes,
  findOrderNoteById,
  createOrderNote,
  updateOrderNote,
  deleteOrderNote,
} from "@controllers/transaction/ordernotes";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllOrderNotesSchema,
  orderNoteIdSchema,
  createOrderNoteSchema,
  updateOrderNoteSchema,
} from "@controllers/transaction/ordernotes/ordernotes.validation";
import Joi from "joi";

const router = Router({ mergeParams: true });

const listParamsSchema = Joi.object({
  order_id: Joi.string().max(200).required().label("Order ID"),
});

router.get(
  "/",
  validateParams(listParamsSchema),
  validateQuery(findAllOrderNotesSchema),
  findAllOrderNotes
);

router.get("/:id", validateParams(orderNoteIdSchema), findOrderNoteById);

router.post(
  "/",
  validateParams(listParamsSchema),
  validateBody(createOrderNoteSchema),
  createOrderNote
);

router.patch(
  "/:id",
  validateParams(orderNoteIdSchema),
  validateBody(updateOrderNoteSchema),
  updateOrderNote
);

router.delete("/:id", validateParams(orderNoteIdSchema), deleteOrderNote);

export default router;
