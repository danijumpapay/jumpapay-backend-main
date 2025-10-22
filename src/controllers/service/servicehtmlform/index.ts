import { Request, Response, NextFunction } from "express";
import serviceHtmlFormService from "@services/service/servicehtmlform.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllServiceHtmlForms = async (
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
      version: query.version,
      sort: query.sort,
    };
    const data = await serviceHtmlFormService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findServiceHtmlFormById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await serviceHtmlFormService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const upsertServiceHtmlForm = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const resultForm = await serviceHtmlFormService.upsert(id, data, trx);
    await trx.commit();
    successResponse(
      res,
      200,
      resultForm,
      `HTML Form Schema for Service ID ${id} (version ${data.version}) saved successfully`
    );
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteServiceHtmlForm = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const version = parseInt(req.params.version, 10);
    const result = await serviceHtmlFormService.remove(id, version, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteAllServiceHtmlForms = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await serviceHtmlFormService.removeAllForService(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
