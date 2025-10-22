import { Request, Response, NextFunction } from "express";
import paymentsService from "@services/transaction/payments.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllPayments = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      company_id: query.company_id,
      invoice_number: query.invoice_number,
      payment_gateway_ref: query.payment_gateway_ref,
      status: query.status,
      payment_method_type: query.payment_method_type,
      paid_at_start: query.paid_at_start,
      paid_at_end: query.paid_at_end,
      created_at_start: query.created_at_start,
      created_at_end: query.created_at_end,
      sort: query.sort,
      withCompany: query.withCompany,
      withItems: query.withItems,
      withItemsOrder: query.withItemsOrder,
    };
    const data = await paymentsService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findPaymentById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const query = req.query as any;
    const relationOptions = {
      withCompany: query.withCompany,
      withItems: query.withItems,
      withItemsOrder: query.withItemsOrder,
    };
    const data = await paymentsService.findOne(id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newPayment = await paymentsService.create(data, trx);
    await trx.commit();

    const createdPayment = await paymentsService.findOne(newPayment.id, {
      withItemsOrder: true,
    });
    successResponse(res, 201, createdPayment, "Payment created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updatePayment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedPayment = await paymentsService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedPayment, "Payment updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deletePayment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await paymentsService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
