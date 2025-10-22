import { Request, Response, NextFunction } from "express";
import orderDetailFeesService from "@services/transaction/orderdetailfees.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllOrderDetailFees = async (
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
      jumpapay_fee_id: query.jumpapay_fee_id,
      order_fee_name: query.order_fee_name,
      order_fee_group: query.order_fee_group,
      sort: query.sort,
      withDetail: query.withDetail,
      withJumpapayFee: query.withJumpapayFee,
    };
    const data = await orderDetailFeesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findOrderDetailFeeById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const query = req.query as any;
    const relationOptions = {
      withDetail: query.withDetail,
      withJumpapayFee: query.withJumpapayFee,
    };
    const data = await orderDetailFeesService.findOne(id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrderDetailFee = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newFee = await orderDetailFeesService.create(data, trx);
    await trx.commit();

    const createdFee = await orderDetailFeesService.findOne(newFee.id, {
      withDetail: true,
      withJumpapayFee: true,
    });
    successResponse(res, 201, createdFee, "Order Detail Fee created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrderDetailFee = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedFee = await orderDetailFeesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedFee, "Order Detail Fee updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrderDetailFee = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await orderDetailFeesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
