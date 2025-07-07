import { Request, Response } from "express";
import CityPlates from "../../../models/common/CityPlates.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = CityPlates.query()
      .select(
        "common.city_plates.id",
        "common.city_plates.city_id",
        "common.city_plates.plate_id",
        "common.city_plates.is_active as isActive"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("CAST(city_id AS TEXT) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("CAST(plate_id AS TEXT) LIKE ?", [`%${searchKeywords}%`]);
          });
        }
      });

    const { total, results } = await rawQuery;

    res.status(200).json(
      successResponse("SUCCESS", {
        results: {
          pagination: paginationResponse(page, limit, total),
          data: results,
        },
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - listData

//#region - detailData
export const detailData = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const data = await CityPlates.query()
      .select(
        "common.city_plates.id",
        "common.city_plates.city_id",
        "common.city_plates.plate_id",
        "common.city_plates.is_active as isActive"
      )
      .findById(id);

    if (data) {
      res.status(200).json(successResponse("SUCCESS", { results: data }));
    } else {
      res.status(404).json(errorResponse("DATA NOT FOUND", { results: null }));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - detailData

//#region - createData
export const createData = async (req: Request, res: Response) => {
  const { city_id, plate_id, is_active } = req.body;

  try {
    const data = await CityPlates.query().insert({
      city_id,
      plate_id,
      is_active: is_active ?? true,
    });

    res.status(201).json(
      successResponse("Created Successfully", {
        errors: null,
        results: data,
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { errors: null, results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { errors: null, results: null }));
    }
  }
};
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { city_id, plate_id, is_active } = req.body;

  try {
    const updated = await CityPlates.query().findById(id).patch({
      city_id,
      plate_id,
      is_active,
    });

    res.status(200).json(
      successResponse("Updated Successfully", { results: updated })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    await CityPlates.query().deleteById(id);

    res.status(200).json(
      successResponse("Deleted Successfully", { results: null })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
