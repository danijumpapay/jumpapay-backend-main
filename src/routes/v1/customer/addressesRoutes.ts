import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/customer/addresses/index";
import { addressesSchema } from "../../../controllers/customer/addresses/addresses.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, addressesSchema, createData);
router.patch("/:id", authMiddleware, addressesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
