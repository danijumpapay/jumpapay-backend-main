import { Router } from "express";
import {
  findAllProvinces,
  findProvinceById,
  createProvince,
  updateProvince,
  deleteProvince,
} from "@controllers/common/provinces";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllProvincesSchema,
  provinceIdSchema,
  createProvinceSchema,
  updateProvinceSchema,
} from "@controllers/common/provinces/provinces.validation";

const router = Router();

router.get("/", validateQuery(findAllProvincesSchema), findAllProvinces);
router.get("/:id", validateParams(provinceIdSchema), findProvinceById);
router.post("/", validateBody(createProvinceSchema), createProvince);
router.patch(
  "/:id",
  validateParams(provinceIdSchema),
  validateBody(updateProvinceSchema),
  updateProvince
);
router.delete("/:id", validateParams(provinceIdSchema), deleteProvince);

export default router;
