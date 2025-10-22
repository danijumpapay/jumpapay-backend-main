import { Request, Response, NextFunction } from "express";
import orderStatusService from "@services/common/orderstatus.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllOrderStatus = async (
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
      is_tag: query.is_tag,
      sort: query.sort,
    };
    const data = await orderStatusService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findOrderStatusById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await orderStatusService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrderStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newStatus = await orderStatusService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newStatus, "Order Status created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrderStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedStatus = await orderStatusService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedStatus, "Order Status updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrderStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await orderStatusService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
