import { Request, Response } from "express";
import { common } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = common.Plates.querySoftDelete()
      .select(
        "id",
        "name",
        "icon",
        "description",
        "is_active as isActive"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(name) LIKE ?", [`%${searchKeywords}%`]);
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
//#endregion - listData

//#region - detailData
export const detailData = async (req: Request, res: Response) => {
  const plateId = req.params.id;

  try {
    const plate = await common.Plates.querySoftDelete()
      .select(
        "id",
        "name",
        "icon",
        "description",
        "is_active as isActive"
      )
      .findById(plateId);

    if (plate) {
      res.status(200).json(
        successResponse("SUCCESS", { results: plate })
      );
    } else {
      res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
    }
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
//#endregion - detailData

//#region - createData
export const createData = async (req: Request, res: Response) => {
  const { id, name, icon, description, isActive } = req.body;

  try {
    const formData = {
      id,
      name,
      icon,
      description,
      is_active: isActive
    };

    const isPlateExist = await common.Plates.querySoftDelete().findById(id);

    if (isPlateExist) {
      res.status(409).json(
        errorResponse("Plate ID already exists", { results: null })
      );
    } else {
      const newPlate = await common.Plates.query().insert(formData);
      res.status(201).json(
        successResponse("SUCCESS", { results: newPlate })
      );
    }
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
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const plateId = req.params.id;
  const { name, icon, description, isActive } = req.body;

  try {
    const updated = await common.Plates.querySoftDelete().findById(plateId).patch({
      name,
      icon,
      description,
      is_active: isActive
    });

    if (updated) {
      res.status(200).json(
        successResponse("UPDATED", { results: updated })
      );
    } else {
      res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
    }
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
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const plateId = req.params.id;

  try {
    await common.Plates.softDelete(Number(plateId));

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
