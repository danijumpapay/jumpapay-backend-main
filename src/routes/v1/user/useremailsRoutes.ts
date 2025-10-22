import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/user/useremails";

import { userEmailsSchema } from "../../../controllers/user/useremails/useremails.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, userEmailsSchema, createData);
router.patch("/:id", authMiddleware, userEmailsSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
