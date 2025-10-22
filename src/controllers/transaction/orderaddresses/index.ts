import { Request, Response, NextFunction } from "express";
import orderAddressesService from "@services/transaction/orderaddresses.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllOrderAddresses = async (
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
      user_id: query.user_id,
      address_id: query.address_id,
      delivery_type: query.delivery_type,
      status: query.status,
      scheduled_date: query.scheduled_date,
      sort: query.sort,
      withOrder: query.withOrder,
      withUser: query.withUser,
      withAddress: query.withAddress,
    };
    const data = await orderAddressesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findOrderAddressById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const query = req.query as any;
    const relationOptions = {
      withOrder: query.withOrder,
      withUser: query.withUser,
      withAddress: query.withAddress,
    };
    const data = await orderAddressesService.findOne(id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrderAddress = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newAddress = await orderAddressesService.create(data, trx);
    await trx.commit();

    const createdAddress = await orderAddressesService.findOne(newAddress.id, {
      withOrder: true,
    });
    successResponse(res, 201, createdAddress, "Order Address created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrderAddress = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedAddress = await orderAddressesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedAddress, "Order Address updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrderAddress = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await orderAddressesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
