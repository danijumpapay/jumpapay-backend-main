import { Request, Response, NextFunction } from "express";
import courierEvidencesService from "@services/transaction/courierevidences.service";
import { successResponse, successListResponse } from "@utils/response";
import { Model } from "objection";
import { BadRequestError } from "@root/src/utils/errors";

interface RequestWithUser extends Request {
  user?: any;
}

export const findAllCourierEvidences = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const order_id = req.params.order_id as string;
    if (!order_id) {
      throw new Error("Missing order_id parameter.");
    }
    const query = req.query as any;
    const options: any = {
      limit: query.limit,
      offset: query.offset,
      order_id: order_id,
      user_id: query.user_id,
      delivery_type: query.delivery_type,
      sort: query.sort,
      withOrder: query.withOrder,
      withUser: query.withUser,
    };
    const data = await courierEvidencesService.findAll(options);
    successListResponse(res, 200, data.results, data.total, options.limit, options.offset);
  } catch (error) {
    next(error);
  }
};

export const findCourierEvidenceById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const query = req.query as any;
    const relationOptions = {
      withOrder: query.withOrder,
      withUser: query.withUser,
    };
    const data = await courierEvidencesService.findOne(id, relationOptions);
    successResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

export const createCourierEvidence = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const data = req.body;
    const file = req.file as any;

    if (!file || !file.location) {
      throw new BadRequestError(
        "Validation error: Evidence file is required ('evidenceFile') and upload failed."
      );
    }
    const fileUrl = file.location as string;
    const fileType = file.mimetype.split("") as string;

    if (!data.order_id && req.params.order_id) {
      data.order_id = req.params.order_id;
    }

    const serviceInput = {
      order_id: data.order_id,
      user_id: data.user_id,
      delivery_type: data.delivery_type,
      fileUrl: fileUrl,
      fileType: fileType,
    };

    const newEvidence = await courierEvidencesService.create(serviceInput, trx);
    await trx.commit();

    const createdEvidence = await courierEvidencesService.findOne(newEvidence.id, {
      withOrder: true,
      withUser: true,
    });
    successResponse(res, 201, createdEvidence, "Courier Evidence created successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const updateCourierEvidence = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const data = req.body;
    const updatedEvidence = await courierEvidencesService.update(id, data, trx);
    await trx.commit();
    successResponse(res, 200, updatedEvidence, "Courier Evidence updated successfully");
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};

export const deleteCourierEvidence = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const trx = await Model.startTransaction();
  try {
    const id = req.params.id;
    const result = await courierEvidencesService.remove(id, trx);
    await trx.commit();
    successResponse(res, 200, null, result.message);
  } catch (error) {
    await trx.rollback();
    next(error);
  }
};
