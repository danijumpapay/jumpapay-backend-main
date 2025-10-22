import { Request, Response, NextFunction } from "express";
import paymentItemsService from "@services/transaction/paymentitems.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllPaymentItems = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      payment_id: query.payment_id,
      order_id: query.order_id,
      sort: query.sort,
      withPayment: query.withPayment,
      withOrder: query.withOrder,
    };
    const data = await paymentItemsService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findPaymentItemByKey = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { payment_id, order_id } = req.params as any;
    const query = req.query as any;
    const relationOptions = {
      withPayment: query.withPayment,
      withOrder: query.withOrder,
    };
    const data = await paymentItemsService.findOne(payment_id, order_id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createPaymentItem = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newItem = await paymentItemsService.create(data, trx);
    await trx.commit();

    const createdItem = await paymentItemsService.findOne(newItem.payment_id, newItem.order_id, {
      withPayment: true,
      withOrder: true,
    });
    successResponse(res, 201, createdItem, "Payment Item relation created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deletePaymentItem = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const { payment_id, order_id } = req.params as any;
    const result = await paymentItemsService.remove(payment_id, order_id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
