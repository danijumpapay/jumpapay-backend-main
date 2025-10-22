import { Request, Response, NextFunction } from "express";
import accessTokensService from "@services/service/accesstokens.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllAccessTokens = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      company_id: query.company_id,
      user_id: query.user_id,
      status: query.status,
      sort: query.sort,
      withScopes: query.withScopes,
      withUser: query.withUser,
      withCompany: query.withCompany,
    };
    const data = await accessTokensService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findAccessTokenById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const query = req.query as any;
    const data = await accessTokensService.findOne(id, {
      withScopes: query.withScopes,
      withUser: query.withUser,
      withCompany: query.withCompany,
    });
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createAccessToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newToken = await accessTokensService.create(data, trx);
    await trx.commit();

    const tokenWithScopes = await accessTokensService.findOne(newToken.id, { withScopes: true });
    successResponse(res, 201, tokenWithScopes, "Access Token created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateAccessToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedToken = await accessTokensService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedToken, "Access Token updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteAccessToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await accessTokensService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
