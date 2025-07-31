import { Router } from "express";
import { 
  listData,
  detailData,
  createData,
  updateData,
  deleteData
} from "../../../controllers/customer/idcards/index";

import { idCardSchema } from "../../../controllers/customer/idcards/idcards.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, idCardSchema, createData);
router.patch("/:id", authMiddleware, idCardSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
