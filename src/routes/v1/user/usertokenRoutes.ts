import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "@controllers/user/usertoken";

import { userTokenSchema } from "@controllers/user/usertoken/usertoken.validation";
import authMiddleware from "@middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, userTokenSchema, createData);
router.patch("/:id", authMiddleware, userTokenSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
