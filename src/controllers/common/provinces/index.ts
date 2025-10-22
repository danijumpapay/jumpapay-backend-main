import { Request, Response, NextFunction } from "express";
import provincesService from "@services/common/provinces.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllProvinces = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      search: query.search,
      sort: query.sort,
      withCities: query.withCities,
    };
    const data = await provincesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findProvinceById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await provincesService.findOne(id, { withCities: query.withCities });
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createProvince = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newProvince = await provincesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newProvince, "Province created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateProvince = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedProvince = await provincesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedProvince, "Province updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteProvince = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await provincesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
