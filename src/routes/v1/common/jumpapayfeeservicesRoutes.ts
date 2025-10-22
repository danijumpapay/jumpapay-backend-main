import { Router } from "express";
import {
  findAllJumpapayFeeServices,
  findJumpapayFeeServiceById,
  createJumpapayFeeService,
  updateJumpapayFeeService,
  deleteJumpapayFeeService,
} from "@controllers/common/jumpapayfeeservices";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllJumpapayFeeServicesSchema,
  jumpapayFeeServiceIdSchema,
  createJumpapayFeeServiceSchema,
  updateJumpapayFeeServiceSchema,
} from "@controllers/common/jumpapayfeeservices/jumpapayfeeservices.validation";

const router = Router();

router.get("/", validateQuery(findAllJumpapayFeeServicesSchema), findAllJumpapayFeeServices);

router.get("/:id", validateParams(jumpapayFeeServiceIdSchema), findJumpapayFeeServiceById);

router.post("/", validateBody(createJumpapayFeeServiceSchema), createJumpapayFeeService);

router.patch(
  "/:id",
  validateParams(jumpapayFeeServiceIdSchema),
  validateBody(updateJumpapayFeeServiceSchema),
  updateJumpapayFeeService
);

router.delete("/:id", validateParams(jumpapayFeeServiceIdSchema), deleteJumpapayFeeService);

export default router;
