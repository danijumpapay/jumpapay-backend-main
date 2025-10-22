import { Router } from "express";
import {
  findAllServiceHtmlForms,
  findServiceHtmlFormById,
  upsertServiceHtmlForm,
  deleteServiceHtmlForm,
  deleteAllServiceHtmlForms,
} from "@controllers/service/servicehtmlform";
import { validateQuery, validateParams, validateBody } from "@middlewares/validationMiddleware";
import {
  findAllServiceHtmlFormsSchema,
  serviceHtmlFormIdSchema,
  createOrUpdateServiceHtmlFormSchema,
  deleteVersionParamsSchema,
} from "@controllers/service/servicehtmlform/servicehtmlform.validation";

const router = Router();

router.get("/", validateQuery(findAllServiceHtmlFormsSchema), findAllServiceHtmlForms);

router.get("/:id", validateParams(serviceHtmlFormIdSchema), findServiceHtmlFormById);

router.put(
  "/:id",
  validateParams(serviceHtmlFormIdSchema),
  validateBody(createOrUpdateServiceHtmlFormSchema),
  upsertServiceHtmlForm
);

router.delete("/:id/:version", validateParams(deleteVersionParamsSchema), deleteServiceHtmlForm);

router.delete("/:id", validateParams(serviceHtmlFormIdSchema), deleteAllServiceHtmlForms);

export default router;
