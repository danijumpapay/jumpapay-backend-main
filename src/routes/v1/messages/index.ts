import { Router } from "express";
import { listMessages } from "@controllers/messages";

const router = Router();

router.get("/", listMessages);

export default router;