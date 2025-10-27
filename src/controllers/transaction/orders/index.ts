import { Request, Response, NextFunction } from "express";
import ordersService from "@services/transaction/orders.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      paid_at_start: query.paid_at_start,
      paid_at_end: query.paid_at_end,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      withUser: query.withUser,
      withCompany: query.withCompany,
      withStatus: query.withStatus,
      withDetails: query.withDetails,
      withAddresses: query.withAddresses,
      withNotes: query.withNotes,
      withPayments: query.withPayments,
    };
    const data = await ordersService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2COrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      paid_at_start: query.paid_at_start,
      paid_at_end: query.paid_at_end,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      withStatus: query.withStatus,
      withDetails: query.withDetails,
      withAddresses: query.withAddresses,
      withNotes: query.withNotes,
      withPayments: query.withPayments,
    };
    const data = await ordersService.findAllB2C(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2CUnpaidOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      isPaid: false,
    };
    const data = await ordersService.findAllB2C(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2CPaidOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      isPaid: true,
    };
    const data = await ordersService.findAllB2C(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2CCompletedOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      isCompleted: true
    };
    const data = await ordersService.findAllB2C(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAllB2BOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      user_id: query.user_id,
      company_id: query.company_id,
      order_status_id: query.order_status_id,
      booking_id: query.booking_id,
      phone: query.phone,
      city_id: query.city_id,
      source: query.source,
      status: query.status,
      order_type: query.order_type,
      order_position: query.order_position,
      payment_type: query.payment_type,
      paid_at_start: query.paid_at_start,
      paid_at_end: query.paid_at_end,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      withUser: query.withUser,
      withCompany: query.withCompany,
      withStatus: query.withStatus,
      withDetails: query.withDetails,
      withAddresses: query.withAddresses,
      withNotes: query.withNotes,
      withPayments: query.withPayments,
    };
    const data = await ordersService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findOrderById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const data = await ordersService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newOrder = await ordersService.create(data, trx);
    await trx.commit();

    const createdOrder = await ordersService.findOne(newOrder.id);
    successResponse(res, 201, createdOrder, "Order created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedOrder = await ordersService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedOrder, "Order updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await ordersService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
