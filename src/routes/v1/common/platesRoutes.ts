import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData
} from "../../../controllers/common/plates";

import { platesSchema } from "../../../controllers/common/plates/plates.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, platesSchema, createData);
router.patch("/:id", authMiddleware, platesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
