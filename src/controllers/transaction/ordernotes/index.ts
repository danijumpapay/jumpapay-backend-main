import { Request, Response, NextFunction } from "express";
import orderNotesService from "@services/transaction/ordernotes.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllOrderNotes = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { order_id } = req.params as any;
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      order_id: order_id,
      sort: query.sort,
      withOrder: query.withOrder,
    };
    const data = await orderNotesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findOrderNoteById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { order_id, id } = req.params as any;
    const query = req.query as any;
    const relationOptions = {
      withOrder: query.withOrder,
    };
    const data = await orderNotesService.findOne(id, order_id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrderNote = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const { order_id } = req.params as any;
    const data = req.body;

    const newNote = await orderNotesService.create(order_id, data, trx);
    await trx.commit();

    successResponse(res, 201, newNote, "Order Note created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrderNote = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const { order_id, id } = req.params as any;
    const data = req.body;
    const updatedNote = await orderNotesService.update(id, order_id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedNote, "Order Note updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrderNote = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const { order_id, id } = req.params as any;
    const result = await orderNotesService.remove(id, order_id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
