import { Router } from "express";
import {
  listData,
  detailData,
  createData,
  updateData,
  deleteData
} from "../../../controllers/user/useractivites";

import { usersActivitiesSchema } from "../../../controllers/user/useractivites/useractivities.validation";
import authMiddleware from "../../../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, listData);
router.get("/:id", authMiddleware, detailData);
router.post("/", authMiddleware, usersActivitiesSchema, createData);
router.patch("/:id", authMiddleware, usersActivitiesSchema, updateData);
router.delete("/:id", authMiddleware, deleteData);

export default router;
