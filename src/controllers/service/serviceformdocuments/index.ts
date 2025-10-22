import { Request, Response, NextFunction } from "express";
import serviceFormDocumentsService from "@services/service/serviceformdocuments.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllServiceFormDocuments = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      service_id: query.service_id,
      whatsapp_form_id: query.whatsapp_form_id,
      sort: query.sort,
    };
    const data = await serviceFormDocumentsService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findServiceFormDocumentById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await serviceFormDocumentsService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const upsertServiceFormDocument = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const resultForm = await serviceFormDocumentsService.upsert(id, data, trx);
    await trx.commit();
    successResponse(
      res,
      200,
      resultForm,
      `Service Form Document definition for Service ID ${id} saved successfully`
    );
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteServiceFormDocument = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await serviceFormDocumentsService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
