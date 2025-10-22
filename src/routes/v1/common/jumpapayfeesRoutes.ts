import { Router } from "express";
import {
  findAllJumpapayFees,
  findJumpapayFeeById,
  createJumpapayFee,
  updateJumpapayFee,
  deleteJumpapayFee,
} from "@controllers/common/jumpapayfees";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllJumpapayFeesSchema,
  jumpapayFeeIdSchema,
  createJumpapayFeeSchema,
  updateJumpapayFeeSchema,
} from "@controllers/common/jumpapayfees/jumpapayfees.validation";

const router = Router();

router.get("/", validateQuery(findAllJumpapayFeesSchema), findAllJumpapayFees);

router.get("/:id", validateParams(jumpapayFeeIdSchema), findJumpapayFeeById);

router.post("/", validateBody(createJumpapayFeeSchema), createJumpapayFee);

router.patch(
  "/:id",
  validateParams(jumpapayFeeIdSchema),
  validateBody(updateJumpapayFeeSchema),
  updateJumpapayFee
);

router.delete("/:id", validateParams(jumpapayFeeIdSchema), deleteJumpapayFee);

export default router;
