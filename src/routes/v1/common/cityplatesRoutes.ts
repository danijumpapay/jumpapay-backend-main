import { Router } from "express";
import {
  findAllCityPlates,
  findCityPlateById,
  createCityPlate,
  updateCityPlate,
  deleteCityPlate,
} from "@controllers/common/cityplates";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllCityPlatesSchema,
  cityPlateIdSchema,
  createCityPlateSchema,
  updateCityPlateSchema,
} from "@controllers/common/cityplates/cityplates.validation";

const router = Router();

router.get("/", validateQuery(findAllCityPlatesSchema), findAllCityPlates);
router.get("/:id", validateParams(cityPlateIdSchema), findCityPlateById);
router.post("/", validateBody(createCityPlateSchema), createCityPlate);
router.patch(
  "/:id",
  validateParams(cityPlateIdSchema),
  validateBody(updateCityPlateSchema),
  updateCityPlate
);
router.delete("/:id", validateParams(cityPlateIdSchema), deleteCityPlate);

export default router;
