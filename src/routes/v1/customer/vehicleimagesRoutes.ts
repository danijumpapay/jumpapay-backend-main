import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/customer/vehicleimages";

import { vehicleImagesSchema } from "../../../controllers/customer/vehicleimages/vehicleimages.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, vehicleImagesSchema, createData);
router.patch("/:id", authMiddleware, vehicleImagesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
