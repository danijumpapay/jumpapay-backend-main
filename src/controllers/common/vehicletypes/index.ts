import { Request, Response } from "express";
import { common } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = common.VehicleTypes.querySoftDelete()
      .select("id", "name")
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.whereRaw("LOWER(name) LIKE ?", [`%${searchKeywords}%`]);
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
      res.status(500).json(
        errorResponse(error.message, { results: null })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", { results: null })
      );
    }
  }
};
//#endregion - listData

//#region - detailData
export const detailData = async (req: Request, res: Response) => {
  const typeId = req.params.id;

  try {
    const vehicleType = await common.VehicleTypes.querySoftDelete()
      .select("id", "name")
      .findById(typeId);

    if (vehicleType) {
      res.status(200).json(
        successResponse("SUCCESS", { results: vehicleType })
      );
    } else {
      res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error.message, { results: null })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", { results: null })
      );
    }
  }
};
//#endregion - detailData

//#region - createData
export const createData = async (req: Request, res: Response) => {
  const { id, name } = req.body;

  try {
    const formData = { id, name };

    const isExist = await common.VehicleTypes.querySoftDelete().findById(id);

    if (isExist) {
      res.status(409).json(
        errorResponse("ID already exists", { results: null })
      );
    } else {
      const newVehicleType = await common.VehicleTypes.query().insert(formData);

      res.status(201).json(
        successResponse("SUCCESS", {
          errors: null,
          results: newVehicleType
        })
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error.message, { errors: null, results: null })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", { errors: null, results: null })
      );
    }
  }
};
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const typeId = req.params.id;
  const { name } = req.body;

  try {
    const updated = await common.VehicleTypes.querySoftDelete().findById(typeId).patch({ name });

    if (updated) {
      const newData = await common.VehicleTypes.querySoftDelete().findById(typeId);

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
      res.status(500).json(
        errorResponse(error.message, { results: null })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", { results: null })
      );
    }
  }
};
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const typeId = req.params.id;

  try {
    await common.VehicleTypes.softDelete(Number(typeId));

    res.status(200).json(
      successResponse("Deleted", { results: null })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error.message, { results: null })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", { results: null })
      );
    }
  }
};
//#endregion - deleteData
