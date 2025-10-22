import { Router } from "express";
import {
  findAllCourierEvidences,
  findCourierEvidenceById,
  createCourierEvidence,
  updateCourierEvidence,
  deleteCourierEvidence,
} from "@controllers/transaction/courierevidences";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllCourierEvidencesSchema,
  courierEvidenceIdSchema,
  createCourierEvidenceSchema,
  updateCourierEvidenceSchema,
} from "@controllers/transaction/courierevidences/courierevidences.validation";
import { uploadEvidenceFile } from "@middlewares/uploadMiddleware";

const router = Router({ mergeParams: true });

router.get("/", validateQuery(findAllCourierEvidencesSchema), findAllCourierEvidences);

router.get("/:id", validateParams(courierEvidenceIdSchema), findCourierEvidenceById);

router.post(
  "/",
  uploadEvidenceFile.single("evidenceFile"),
  validateBody(createCourierEvidenceSchema),
  createCourierEvidence
);

router.patch(
  "/:id",
  validateParams(courierEvidenceIdSchema),
  validateBody(updateCourierEvidenceSchema),
  updateCourierEvidence
);

router.delete("/:id", validateParams(courierEvidenceIdSchema), deleteCourierEvidence);

export default router;
