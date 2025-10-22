import { Request, Response, NextFunction } from "express";
import jumpapayFeeGroupsService from "@services/common/jumpapayfeegroups.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllJumpapayFeeGroups = async (
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
      withFees: query.withFees,
    };
    const data = await jumpapayFeeGroupsService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findJumpapayFeeGroupById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await jumpapayFeeGroupsService.findOne(id, { withFees: query.withFees });
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createJumpapayFeeGroup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newJumpapayFeeGroup = await jumpapayFeeGroupsService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newJumpapayFeeGroup, "Jumpapay Fee Group created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateJumpapayFeeGroup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedJumpapayFeeGroup = await jumpapayFeeGroupsService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedJumpapayFeeGroup, "Jumpapay Fee Group updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteJumpapayFeeGroup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await jumpapayFeeGroupsService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
