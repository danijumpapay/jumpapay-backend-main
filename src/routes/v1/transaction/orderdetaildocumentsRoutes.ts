import { Router, Request, Response, NextFunction } from "express";
import {
  findAllOrderDetailDocuments,
  findOrderDetailDocumentById,
  createOrderDetailDocument,
  updateOrderDetailDocument,
  deleteOrderDetailDocument,
} from "@controllers/transaction/orderdetaildocuments";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllOrderDetailDocumentsSchema,
  orderDetailDocumentIdSchema,
  createOrderDetailDocumentSchema,
  updateOrderDetailDocumentSchema,
} from "@controllers/transaction/orderdetaildocuments/orderdetaildocuments.validation";
import { uploadDocument } from "@middlewares/uploadMiddleware";

const router = Router();

const addFileUrlToBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    req.body.document = (req.file as any).location;
  } else if (req.files) {
    if (Array.isArray(req.files)) {
      req.body.documents = (req.files as Express.Multer.File[]).map((f) => f.location || f.path);
    } else {
      const filesByField: Record<string, any> = {};
      const files = req.files as Record<string, Express.Multer.File[]>;

      for (const [fieldName, fileArray] of Object.entries(files)) {
        filesByField[fieldName] = fileArray.map((f) => f.location || f.path);
      }
      Object.assign(req.body, filesByField);
    }
  }
  next();
};

router.get("/", validateQuery(findAllOrderDetailDocumentsSchema), findAllOrderDetailDocuments);
router.get("/:id", validateParams(orderDetailDocumentIdSchema), findOrderDetailDocumentById);
router.post(
  "/",
  uploadDocument.single("documentFile"),
  addFileUrlToBody,
  validateBody(createOrderDetailDocumentSchema),
  createOrderDetailDocument
);
router.post("/", validateBody(createOrderDetailDocumentSchema), createOrderDetailDocument);
router.patch(
  "/:id",
  validateParams(orderDetailDocumentIdSchema),
  validateBody(updateOrderDetailDocumentSchema),
  updateOrderDetailDocument
);
router.delete("/:id", validateParams(orderDetailDocumentIdSchema), deleteOrderDetailDocument);

export default router;
