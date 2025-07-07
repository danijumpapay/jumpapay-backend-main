import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/transaction/orderaddresses";
import { orderAddressesSchema } from "../../../controllers/transaction/orderaddresses/orderaddresses.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, orderAddressesSchema, createData);
router.patch("/:id", authMiddleware, orderAddressesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
