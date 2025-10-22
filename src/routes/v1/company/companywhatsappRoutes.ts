import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/company/companywhatsapp";

import { companyWhatsappSchema } from "../../../controllers/company/companywhatsapp/companywhatsapp.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, companyWhatsappSchema, createData);
router.patch("/:id", authMiddleware, companyWhatsappSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
