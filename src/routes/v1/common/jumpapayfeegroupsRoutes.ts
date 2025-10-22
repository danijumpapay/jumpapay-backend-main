import { Router } from "express";
import {
  findAllJumpapayFeeGroups,
  findJumpapayFeeGroupById,
  createJumpapayFeeGroup,
  updateJumpapayFeeGroup,
  deleteJumpapayFeeGroup,
} from "@controllers/common/jumpapayfeegroups";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllJumpapayFeeGroupsSchema,
  jumpapayFeeGroupIdSchema,
  createJumpapayFeeGroupSchema,
  updateJumpapayFeeGroupSchema,
} from "@controllers/common/jumpapayfeegroups/jumpapayfeegroups.validation";

const router = Router();

router.get("/", validateQuery(findAllJumpapayFeeGroupsSchema), findAllJumpapayFeeGroups);

router.get("/:id", validateParams(jumpapayFeeGroupIdSchema), findJumpapayFeeGroupById);

router.post("/", validateBody(createJumpapayFeeGroupSchema), createJumpapayFeeGroup);

router.patch(
  "/:id",
  validateParams(jumpapayFeeGroupIdSchema),
  validateBody(updateJumpapayFeeGroupSchema),
  updateJumpapayFeeGroup
);

router.delete("/:id", validateParams(jumpapayFeeGroupIdSchema), deleteJumpapayFeeGroup);

export default router;
