import { Router } from "express";
import { listMessages } from "@controllers/messages";

const router = Router();

router.get("/:roomId", listMessages);

export default router;