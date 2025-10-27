import { Request, Response, NextFunction } from "express";
import servicesService from "@services/service/services.service";
import servicesdashboardService from "@services/service/servicesdashboard.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllServicesForDashboard = async (
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
      sort: query.sort,
      withFees: query.withFees,
    };
    const data = await servicesdashboardService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findServiceBySlug = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const slug = String(req.params.slug);
    const query = req.query as any;
    const data = await servicesdashboardService.findBySlug(slug);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};
