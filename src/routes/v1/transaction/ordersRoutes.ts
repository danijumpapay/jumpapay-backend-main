import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData,
} from "../../../controllers/transaction/orders/index";
import { ordersSchema } from "../../../controllers/transaction/orders/orders.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, ordersSchema, createData);
router.patch("/:id", authMiddleware, ordersSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
