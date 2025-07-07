import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/common/cityplates";

import { cityPlatesSchema } from "../../../controllers/common/cityplates/cityplates.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, cityPlatesSchema, createData);
router.patch("/:id", authMiddleware, cityPlatesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
