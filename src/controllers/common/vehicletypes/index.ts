import { Request, Response, NextFunction } from "express";
import vehicleTypesService from "../../../services/common/vehicletypes.service";
import { successResponse, successListResponse } from "../../../utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllVehicleTypes = async (
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
    };
    const data = await vehicleTypesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findVehicleTypeById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await vehicleTypesService.findOne(id);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createVehicleType = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newVehicleType = await vehicleTypesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newVehicleType, "Vehicle Type created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateVehicleType = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedVehicleType = await vehicleTypesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedVehicleType, "Vehicle Type updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteVehicleType = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await vehicleTypesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
