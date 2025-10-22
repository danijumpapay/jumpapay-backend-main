import { Request, Response, NextFunction } from "express";
import serviceFormOrdersService from "@services/service/serviceformorders.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllServiceFormOrders = async (
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
    const data = await serviceFormOrdersService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findServiceFormOrderById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await serviceFormOrdersService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const upsertServiceFormOrder = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const resultForm = await serviceFormOrdersService.upsert(id, data, trx);
    await trx.commit();
    successResponse(
      res,
      200,
      resultForm,
      `Service Form Order definition for Service ID ${id} saved successfully`
    );
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteServiceFormOrder = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await serviceFormOrdersService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
