import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/customer/bpkbdocuments/index";
import { bpkbDocumentsSchema } from "../../../controllers/customer/bpkbdocuments/bpkbdocuments.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, bpkbDocumentsSchema, createData);
router.patch("/:id", authMiddleware, bpkbDocumentsSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
