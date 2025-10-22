import { Request, Response, NextFunction } from "express";
import apiScopesService from "@services/service/apiscopes.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllApiScopes = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      module_id: query.module_id,
      access: query.access,
      sort: query.sort,
      withModule: query.withModule,
    };
    const data = await apiScopesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findApiScopeById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await apiScopesService.findOne(id, { withModule: query.withModule });
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createApiScope = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newApiScope = await apiScopesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newApiScope, "API Scope created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateApiScope = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedApiScope = await apiScopesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedApiScope, "API Scope updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteApiScope = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await apiScopesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
