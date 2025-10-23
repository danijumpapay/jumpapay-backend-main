import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "@controllers/customer/vehicles";

import { vehiclesSchema } from "@controllers/customer/vehicles/vehicles.validation";
import authMiddleware from "@middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, vehiclesSchema, createData);
router.patch("/:id", authMiddleware, vehiclesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
