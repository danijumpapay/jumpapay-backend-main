import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData
} from "../../../controllers/company/companies";

import { companiesSchema } from "../../../controllers/company/companies/companies.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, companiesSchema, createData);
router.patch("/:id", authMiddleware, companiesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
