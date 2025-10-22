import { Request, Response, NextFunction } from "express";
import citiesService from "@services/common/cities.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllCities = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      search: query.search,
      province_id: query.province_id,
      sort: query.sort,
      withProvince: query.withProvince,
      withCityPlates: query.withCityPlates,
    };
    const data = await citiesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findCityById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await citiesService.findOne(id, {
      withProvince: query.withProvince,
      withCityPlates: query.withCityPlates,
    });

    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createCity = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newCity = await citiesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newCity, "City created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateCity = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedCity = await citiesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedCity, "City updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteCity = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await citiesService.remove(id, trx);
    await trx.commit();

    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
