import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/user/userotp/index";
import { userOtpSchema } from "../../../controllers/user/userotp/userotp.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, userOtpSchema, createData);
router.patch("/:id", authMiddleware, userOtpSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
