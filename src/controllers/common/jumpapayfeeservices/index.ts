import { Request, Response, NextFunction } from "express";
import jumpapayFeeServicesService from "@services/common/jumpapayfeeservices.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllJumpapayFeeServices = async (
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
      sort: query.sort,
    };
    const data = await jumpapayFeeServicesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findJumpapayFeeServiceById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await jumpapayFeeServicesService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createJumpapayFeeService = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newJumpapayFeeService = await jumpapayFeeServicesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newJumpapayFeeService, "Jumpapay Fee Service created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateJumpapayFeeService = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedJumpapayFeeService = await jumpapayFeeServicesService.update(id, data, trx);
    await trx.commit();
    successResponse(
      res,
      200,
      updatedJumpapayFeeService,
      "Jumpapay Fee Service updated successfully"
    );
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteJumpapayFeeService = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await jumpapayFeeServicesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
