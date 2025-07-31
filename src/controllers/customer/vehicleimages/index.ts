import { Request, Response } from "express";
import VehicleImages from "../../../models/customer/VehicleImages.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = VehicleImages.query()
      .select(
        "id",
        "vehicle_id as vehicleId",
        "original_image as originalImage",
        "image",
        "created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(original_image) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(image) LIKE ?", [`%${searchKeywords}%`]);
          });
        }
      });

    const { total, results } = await rawQuery;

    res.status(200).json(
      successResponse("SUCCESS", {
        results: {
          pagination: paginationResponse(page, limit, total),
          data: results
        }
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - listData

//#region - detailData
export const detailData = async (req: Request, res: Response) => {
  const imageId = req.params.id;

  try {
    const image = await VehicleImages.query()
      .select(
        "id",
        "vehicle_id as vehicleId",
        "original_image as originalImage",
        "image",
        "created_at as createdAt"
      )
      .findById(imageId);

    if (image) {
      res.status(200).json(successResponse("SUCCESS", { results: image }));
    } else {
      res.status(404).json(errorResponse("DATA NOT FOUND", { results: null }));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - detailData

//#region - createData
export const createData = async (req: Request, res: Response) => {
  const { vehicleId, originalImage, image } = req.body;

  try {
    interface FormData {
      vehicle_id: string;
      original_image?: string | null;
      image?: string | null;
      created_at?: string | null;
    }

    const formData: FormData = {
      vehicle_id: vehicleId,
      original_image: originalImage,
      image,
      created_at: new Date().toISOString()
    };

    const newImage = await VehicleImages.query().insert(formData);

    res.status(201).json(
      successResponse("SUCCESS", {
        errors: null,
        results: newImage
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error?.message, {
          errors: null,
          results: null
        })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", {
          errors: null,
          results: null
        })
      );
    }
  }
};
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const imageId = req.params.id;
  const { vehicleId, originalImage, image } = req.body;

  try {
    const updated = await VehicleImages.query()
      .findById(imageId)
      .patch({
        vehicle_id: vehicleId,
        original_image: originalImage,
        image
      });

    if (updated) {
      const newData = await VehicleImages.query().findById(imageId);
      res.status(200).json(
        successResponse("UPDATED", { results: newData })
      );
    } else {
      res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const imageId = req.params.id;

  try {
    const image = await VehicleImages.query().findById(imageId);

    if (!image) {
      return res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
    }

    await VehicleImages.query().deleteById(imageId);

    res.status(200).json(
      successResponse("DELETED", { results: null })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error?.message, { results: null })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", { results: null })
      );
    }
  }
};
//#endregion - deleteData
