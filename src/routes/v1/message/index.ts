import { Router } from "express";
import { sendMessage } from "@controllers/messages";

const router = Router();

router.post("/", sendMessage);

export default router;