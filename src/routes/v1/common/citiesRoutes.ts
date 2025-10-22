import { Router } from "express";
import {
  findAllCities,
  findCityById,
  createCity,
  updateCity,
  deleteCity,
} from "@controllers/common/cities";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllCitiesSchema,
  cityIdSchema,
  createCitySchema,
  updateCitySchema,
} from "@controllers/common/cities/cities.validation";

const router = Router();

router.get("/", validateQuery(findAllCitiesSchema), findAllCities);
router.get("/:id", validateParams(cityIdSchema), findCityById);
router.post("/", validateBody(createCitySchema), createCity);
router.patch("/:id", validateParams(cityIdSchema), validateBody(updateCitySchema), updateCity);
router.delete("/:id", validateParams(cityIdSchema), deleteCity);

export default router;
