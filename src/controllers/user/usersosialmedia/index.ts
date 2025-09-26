import { Request, Response } from "express";
import { user } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = user.UserSosialMedia.query()
      .select(
        "user_sosial_media.id",
        "user_sosial_media.user_id",
        "user_sosial_media.sosial",
        "user_sosial_media.link",
        "user_sosial_media.created_at as createdAt"
      )
      .from("user.user_sosial_media")
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(user_sosial_media.link) LIKE ?", [`%${searchKeywords}%`]);
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
  const id = req.params.id;

  try {
    const data = await user.UserSosialMedia.query()
      .select(
        "user_sosial_media.id",
        "user_sosial_media.user_id",
        "user_sosial_media.sosial",
        "user_sosial_media.link",
        "user_sosial_media.created_at as createdAt"
      )
      .from("user.user_sosial_media")
      .findById(id);

    if (data) {
      res.status(200).json(successResponse("SUCCESS", { results: data }));
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
  const { user_id, sosial, link } = req.body;

  try {
    const data = await user.UserSosialMedia.query().insert({
      user_id,
      sosial,
      link
    });

    res.status(201).json(
      successResponse("Created Successfully", {
        errors: null,
        results: data
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error?.message, { errors: null, results: null })
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
  const id = req.params.id;
  const { user_id, sosial, link } = req.body;

  try {
    const updated = await user.UserSosialMedia.query().findById(id).patch({
      user_id,
      sosial,
      link
    });

    if (updated) {
      const newData = await user.UserSosialMedia.query().findById(id);

      res.status(200).json(
        successResponse("Updated Successfully", { results: newData })
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
  const id = req.params.id;

  try {
    await user.UserSosialMedia.query().deleteById(id);

    res.status(200).json(
      successResponse("Deleted Successfully", { results: null })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
