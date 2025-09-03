import { Router } from "express";
import { listData } from "@controllers/merchants";
import { listData as listMerchantWhatsapp } from "@controllers/whatsapps";

const router = Router();

router.get("/", listData);
router.get("/whatsapp/:merchantId", listMerchantWhatsapp);

export default router;