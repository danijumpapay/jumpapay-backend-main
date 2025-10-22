import { Request, Response, NextFunction } from "express";
import platesService from "@services/common/plates.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllPlates = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      search: query.search,
      is_active: query.is_active,
      sort: query.sort,
      withCities: query.withCities,
    };
    const data = await platesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findPlateById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await platesService.findOne(id, { withCities: query.withCities });
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createPlate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newPlate = await platesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newPlate, "Plate created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updatePlate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedPlate = await platesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedPlate, "Plate updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deletePlate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await platesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
