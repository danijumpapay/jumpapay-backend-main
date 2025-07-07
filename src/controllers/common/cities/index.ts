import { Request, Response } from "express";
import Cities from "../../../models/common/Cities.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = Cities.querySoftDelete()
      .select(
        "cities.id",
        "cities.name as cityName",
        "cities.icon as cityIcon"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.whereRaw("LOWER(cities.name) LIKE ?", [`%${searchKeywords}%`]);
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
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - listData

//#region - detailData
export const detailData = async (req: Request, res: Response) => {
  const cityId = Number(req.params.id);

  try {
    const city = await Cities.querySoftDelete()
      .select(
        "cities.id",
        "cities.name as cityName",
        "cities.icon as cityIcon"
      )
      .findById(cityId);

    if (city) {
      res.status(200).json(successResponse("SUCCESS", { results: city }));
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
  const { id, name, icon } = req.body;

  try {
    const formData = { id, name, icon };

    const newCity = await Cities.query().insert(formData);

    res.status(201).json(successResponse("SUCCESS", { results: newCity }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const cityId = Number(req.params.id);
  const { name, icon } = req.body;

  try {
    const updated = await Cities.query().findById(cityId).patch({ name, icon });

    if (updated) {
      res.status(200).json(successResponse("UPDATED", { results: updated }));
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
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const cityId = Number(req.params.id);

  try {
    await Cities.softDelete(cityId);

    res.status(200).json(successResponse("DELETED", { results: null }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
