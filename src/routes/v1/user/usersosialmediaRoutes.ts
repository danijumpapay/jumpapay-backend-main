import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData
} from "../../../controllers/user/usersosialmedia/index";

import { userSosialMediaSchema } from "../../../controllers/user/usersosialmedia/usersosialmedia.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, userSosialMediaSchema, createData);
router.patch("/:id", authMiddleware, userSosialMediaSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
