import { Request, Response, NextFunction } from "express";
import modulesService from "@services/service/modules.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllModules = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      search: query.search,
      sort: query.sort,
      withGroup: query.withGroup,
      withApiScopes: query.withApiScopes,
    };
    const data = await modulesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findModuleById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await modulesService.findOne(id, {
      withGroup: query.withGroup,
      withApiScopes: query.withApiScopes,
    });
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createModule = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newModule = await modulesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newModule, "Module created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateModule = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedModule = await modulesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedModule, "Module updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteModule = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await modulesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
