import { Request, Response, NextFunction } from "express";
import orderFormDatasService from "@services/transaction/orderformdatas.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllOrderFormDatas = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      order_detail_id: query.order_detail_id,
      form_token: query.form_token,
      sort: query.sort,
      withDetail: query.withDetail,
    };
    const data = await orderFormDatasService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findOrderFormDataById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const query = req.query as any;
    const relationOptions = {
      withDetail: query.withDetail,
    };
    const data = await orderFormDatasService.findOne(id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrderFormData = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newFormData = await orderFormDatasService.create(data, trx);
    await trx.commit();

    const createdFormData = await orderFormDatasService.findOne(newFormData.id, {
      withDetail: true,
    });
    successResponse(res, 201, createdFormData, "Order Form Data created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrderFormData = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedFormData = await orderFormDatasService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedFormData, "Order Form Data updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrderFormData = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await orderFormDatasService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
