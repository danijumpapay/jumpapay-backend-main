import { Router } from "express";
import { sendMessage } from "@controllers/messages";
import { upload } from "@middlewares/uploadMiddleware";

const router = Router();

router.post("/:phoneId", upload.any(), sendMessage);

export default router;