import { Request, Response, NextFunction } from "express";
import orderDetailDocumentsService from "@services/transaction/orderdetaildocuments.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllOrderDetailDocuments = async (
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
      uploaded_by: query.uploaded_by,
      type: query.type,
      sort: query.sort,
      withDetail: query.withDetail,
      withUploader: query.withUploader,
    };
    const data = await orderDetailDocumentsService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findOrderDetailDocumentById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const query = req.query as any;
    const relationOptions = {
      withDetail: query.withDetail,
      withUploader: query.withUploader,
    };
    const data = await orderDetailDocumentsService.findOne(id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createOrderDetailDocument = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;

    const newDocument = await orderDetailDocumentsService.create(data, trx);
    await trx.commit();

    const createdDocument = await orderDetailDocumentsService.findOne(newDocument.id, {
      withDetail: true,
      withUploader: true,
    });
    successResponse(res, 201, createdDocument, "Order Detail Document created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateOrderDetailDocument = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedDocument = await orderDetailDocumentsService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedDocument, "Order Detail Document updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteOrderDetailDocument = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await orderDetailDocumentsService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
