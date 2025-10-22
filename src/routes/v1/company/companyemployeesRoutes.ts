import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/company/companyemployees";

import { companyEmployeesSchema } from "../../../controllers/company/companyemployees/companyemployees.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, companyEmployeesSchema, createData);
router.patch("/:id", authMiddleware, companyEmployeesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
