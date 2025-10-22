import { Router } from "express";
import {
  findAllServiceFormDocuments,
  findServiceFormDocumentById,
  upsertServiceFormDocument,
  deleteServiceFormDocument,
} from "@controllers/service/serviceformdocuments";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllServiceFormDocumentsSchema,
  serviceFormDocumentIdSchema,
  createOrUpdateServiceFormDocumentSchema,
} from "@controllers/service/serviceformdocuments/serviceformdocuments.validation";

const router = Router();

router.get("/", validateQuery(findAllServiceFormDocumentsSchema), findAllServiceFormDocuments);

router.get("/:id", validateParams(serviceFormDocumentIdSchema), findServiceFormDocumentById);

router.put(
  "/:id",
  validateParams(serviceFormDocumentIdSchema),
  validateBody(createOrUpdateServiceFormDocumentSchema),
  upsertServiceFormDocument
);

router.delete("/:id", validateParams(serviceFormDocumentIdSchema), deleteServiceFormDocument);

export default router;
