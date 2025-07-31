import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData
} from "../../../controllers/common/cities";

import { citiesSchema } from "../../../controllers/common/cities/cities.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, citiesSchema, createData);
router.patch("/:id", authMiddleware, citiesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
