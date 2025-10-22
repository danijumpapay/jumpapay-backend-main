import { Request, Response, NextFunction } from "express";
import cityPlatesService from "@services/common/cityplates.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllCityPlates = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      city_id: query.city_id,
      plate_id: query.plate_id,
      is_active: query.is_active,
      sort: query.sort,
    };
    const data = await cityPlatesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findCityPlateById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const data = await cityPlatesService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createCityPlate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newRelation = await cityPlatesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newRelation, "City-Plate relation created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateCityPlate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedRelation = await cityPlatesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedRelation, "City-Plate relation status updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteCityPlate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await cityPlatesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
