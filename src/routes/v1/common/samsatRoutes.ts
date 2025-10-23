import { Router } from "express";
import {
  findAllSamsat,
  findSamsatById,
  createSamsat,
  updateSamsat,
  deleteSamsat,
} from "@controllers/common/samsat";
import {
  validateQuery,
  validateParams,
  validateBody,
} from "@middlewares/validationMiddleware";
import {
  findAllSamsatSchema,
  samsatIdSchema,
  createSamsatSchema,
  updateSamsatSchema,
} from "@controllers/common/samsat/samsat.validation";

const router = Router();

router.get("/", validateQuery(findAllSamsatSchema), findAllSamsat);
router.get("/:id", validateParams(samsatIdSchema), findSamsatById);
router.post("/", validateBody(createSamsatSchema), createSamsat);
router.patch(
  "/:id",
  validateParams(samsatIdSchema),
  validateBody(updateSamsatSchema),
  updateSamsat
);
router.delete("/:id", validateParams(samsatIdSchema), deleteSamsat);

export default router;
