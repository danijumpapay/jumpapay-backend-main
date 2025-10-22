import { Request, Response, NextFunction } from "express";
import paymentMethodsService from "@services/common/paymentmethods.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllPaymentMethods = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      search: query.search,
      is_active: query.is_active,
      sort: query.sort,
    };
    const data = await paymentMethodsService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findPaymentMethodById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await paymentMethodsService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createPaymentMethod = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newPaymentMethod = await paymentMethodsService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newPaymentMethod, "PaymentMethod created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updatePaymentMethod = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedPaymentMethod = await paymentMethodsService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedPaymentMethod, "PaymentMethod updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deletePaymentMethod = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await paymentMethodsService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
