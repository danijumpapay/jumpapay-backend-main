import { Request, Response, NextFunction } from "express";
import tokenScopesService from "@services/service/tokenscopes.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllTokenScopes = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      access_token_id: query.access_token_id,
      api_scope_id: query.api_scope_id,
    };
    const data = await tokenScopesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findTokenScopeByKey = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { access_token_id, api_scope_id } = req.params as any;
    const data = await tokenScopesService.findOne(access_token_id, parseInt(api_scope_id, 10));
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createTokenScope = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newRelation = await tokenScopesService.create(data, trx);
    await trx.commit();

    const createdData = await tokenScopesService.findOne(
      newRelation.access_token_id,
      newRelation.api_scope_id
    );
    successResponse(res, 201, createdData, "Token scope relation created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteTokenScope = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const { access_token_id, api_scope_id } = req.params as any;
    const result = await tokenScopesService.remove(
      access_token_id,
      parseInt(api_scope_id, 10),
      trx
    );
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
