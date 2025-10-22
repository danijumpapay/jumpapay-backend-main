import { Request, Response, NextFunction } from "express";
import moduleGroupsService from "../../../services/service/modulegroups.service";
import { successResponse, successListResponse } from "../../../utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllModuleGroups = async (
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
      sort: query.sort,
      withModules: query.withModules,
    };
    const data = await moduleGroupsService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findModuleGroupById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await moduleGroupsService.findOne(id, { withModules: query.withModules });
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createModuleGroup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newGroup = await moduleGroupsService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newGroup, "Module Group created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateModuleGroup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedGroup = await moduleGroupsService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedGroup, "Module Group updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteModuleGroup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await moduleGroupsService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
