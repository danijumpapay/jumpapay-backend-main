import { Router } from "express";
import { listUntakenChats, listTakenChats } from "@controllers/chats";

const router = Router();

router.get("/untaken/:phoneId", listUntakenChats);
router.get("/taken/:phoneId", listTakenChats);

export default router;