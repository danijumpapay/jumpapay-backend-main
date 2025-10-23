import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "@controllers/customer/stnkdocuments";

import { stnkDocumentsSchema } from "@controllers/customer/stnkdocuments/stnkdocuments.validation";
import authMiddleware from "@middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, stnkDocumentsSchema, createData);
router.patch("/:id", authMiddleware, stnkDocumentsSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
