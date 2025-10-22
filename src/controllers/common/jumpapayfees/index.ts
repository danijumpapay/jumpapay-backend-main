import { Request, Response, NextFunction } from "express";
import jumpapayFeesService from "../../../services/common/jumpapayfees.service";
import { successResponse, successListResponse } from "../../../utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllJumpapayFees = async (
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
      jumpapay_fee_group_id: query.jumpapay_fee_group_id,
      code: query.code,
      is_active: query.is_active,
      sort: query.sort,
      withGroup: query.withGroup,
      withServices: query.withServices,
    };

    const data = await jumpapayFeesService.findAll(options);

    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findJumpapayFeeById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;

    const data = await jumpapayFeesService.findOne(id, {
      withGroup: query.withGroup,
      withServices: query.withServices,
    });

    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createJumpapayFee = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;

    const newFee = await jumpapayFeesService.create(data, trx);

    await trx.commit();

    successResponse(res, 201, newFee, "Jumpapay Fee created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateJumpapayFee = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;

    const updatedFee = await jumpapayFeesService.update(id, data, trx);

    await trx.commit();
    successResponse(res, 200, updatedFee, "Jumpapay Fee updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteJumpapayFee = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);

    const result = await jumpapayFeesService.remove(id, trx);

    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
