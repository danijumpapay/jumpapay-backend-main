import { Request, Response, NextFunction } from "express";
import servicesService from "@services/service/services.service";
import servicesdashboardService from "@services/service/servicesdashboard.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllServicesForDashboard = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const options = {
      limit: query.limit,
      offset: query.offset,
      search: query.search,
      sort: query.sort,
      withFees: query.withFees,
    };
    const data = await servicesdashboardService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findServiceById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const query = req.query as any;
    const data = await servicesService.findOne(id, { withFees: query.withFees });
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createService = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const newService = await servicesService.create(data, trx);
    await trx.commit();
    successResponse(res, 201, newService, "Service created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateService = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updatedService = await servicesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedService, "Service updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteService = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const trx = await Model.startTransaction();
  try {
    const id = parseInt(req.params.id, 10);
    const result = await servicesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
