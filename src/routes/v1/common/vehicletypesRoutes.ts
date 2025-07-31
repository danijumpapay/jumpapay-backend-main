import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/common/vehicletypes";

import { vehicleTypesSchema } from "../../../controllers/common/vehicletypes/vehicletypes.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, vehicleTypesSchema, createData);
router.patch("/:id", authMiddleware, vehicleTypesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
