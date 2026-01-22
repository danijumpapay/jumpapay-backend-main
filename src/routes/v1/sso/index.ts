import { Router } from "express";
import requireAuth from "@middlewares/authMiddleware";
import {
  exchange,
  check
} from "@controllers/sso";

const router = Router();

router.post("/exchange", exchange);
router.get("/check", requireAuth, check);

export default router;