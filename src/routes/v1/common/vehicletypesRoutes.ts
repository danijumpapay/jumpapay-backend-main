import { Router } from "express";
import {
  findAllVehicleTypes,
  findVehicleTypeById,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from "@controllers/common/vehicletypes";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllVehicleTypesSchema,
  vehicleTypeIdSchema,
  createVehicleTypeSchema,
  updateVehicleTypeSchema,
} from "@controllers/common/vehicletypes/vehicletypes.validation";

const router = Router();

router.get("/", validateQuery(findAllVehicleTypesSchema), findAllVehicleTypes);
router.get("/:id", validateParams(vehicleTypeIdSchema), findVehicleTypeById);
router.post("/", validateBody(createVehicleTypeSchema), createVehicleType);
router.patch(
  "/:id",
  validateParams(vehicleTypeIdSchema),
  validateBody(updateVehicleTypeSchema),
  updateVehicleType
);
router.delete("/:id", validateParams(vehicleTypeIdSchema), deleteVehicleType);

export default router;
