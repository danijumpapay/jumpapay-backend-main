import { Router } from "express";
import { listData } from "@controllers/whatsapps";

const router = Router();

router.get("/:merchantId", listData);

export default router;