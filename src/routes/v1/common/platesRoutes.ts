import { Router } from "express";
import {
  findAllPlates,
  findPlateById,
  createPlate,
  updatePlate,
  deletePlate,
} from "@controllers/common/plates";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllPlatesSchema,
  plateIdSchema,
  createPlateSchema,
  updatePlateSchema,
} from "@controllers/common/plates/plates.validation";

const router = Router();

router.get("/", validateQuery(findAllPlatesSchema), findAllPlates);
router.get("/:id", validateParams(plateIdSchema), findPlateById);
router.post("/", validateBody(createPlateSchema), createPlate);
router.patch("/:id", validateParams(plateIdSchema), validateBody(updatePlateSchema), updatePlate);
router.delete("/:id", validateParams(plateIdSchema), deletePlate);

export default router;
