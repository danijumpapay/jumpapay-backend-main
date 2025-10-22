import { Request, Response, NextFunction } from "express";
import orderDetailsService from "@services/transaction/orderdetails.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllOrderDetails = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      order_id: query.order_id,
      service_id: query.service_id,
      vehicle_id: query.vehicle_id,
      samsat_id: query.samsat_id,
      sort: query.sort,
      withOrder: query.withOrder,
      withService: query.withService,
      withVehicle: query.withVehicle,
      withSamsat: query.withSamsat,
      withFees: query.withFees,
      withDocuments: query.withDocuments,
    };
    const data = await orderDetailsService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findOrderDetailById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const query = req.query as any;
    const relationOptions = {
      withOrder: query.withOrder,
      withService: query.withService,
      withVehicle: query.withVehicle,
      withSamsat: query.withSamsat,
      withFees: query.withFees,
      withDocuments: query.withDocuments,
    };
    const data = await orderDetailsService.findOne(id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrderDetail = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newDetail = await orderDetailsService.create(data, trx);
    await trx.commit();

    const createdDetail = await orderDetailsService.findOne(newDetail.id, { withService: true });
    successResponse(res, 201, createdDetail, "Order Detail created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrderDetail = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedDetail = await orderDetailsService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedDetail, "Order Detail updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrderDetail = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await orderDetailsService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
