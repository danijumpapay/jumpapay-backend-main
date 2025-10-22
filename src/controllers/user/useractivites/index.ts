import { Request, Response } from "express";
import { user } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponseOld, errorResponseOld } from "@utils/response";
import { generateId } from "@utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = user.UserActivities.query()
      .select(
        "id",
        "user_id as userId",
        "activity_name as activityName",
        "activity_detail as activityDetail",
        "created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.whereRaw("LOWER(activity_name) LIKE ?", [`%${searchKeywords}%`]);
        }
      });

    const { total, results } = await rawQuery;

    res.status(200).json(
      successResponseOld("SUCCESS", {
        results: {
          pagination: paginationResponse(page, limit, total),
          data: results,
        },
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponseOld(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponseOld("Internal server error", { results: null }));
    }
  }
};
//#endregion - listData

//#region - detailData
export const detailData = async (req: Request, res: Response) => {
  const activityId = req.params.id;

  try {
    const activity = await user.UserActivities.query()
      .select(
        "id",
        "user_id as userId",
        "activity_name as activityName",
        "activity_detail as activityDetail",
        "created_at as createdAt"
      )
      .findById(activityId);

    if (activity) {
      res.status(200).json(successResponseOld("SUCCESS", { results: activity }));
    } else {
      res.status(404).json(errorResponseOld("DATA NOT FOUND", { results: null }));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponseOld(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponseOld("Internal server error", { results: null }));
    }
  }
};
//#endregion - detailData

//#region - createData
export const createData = async (req: Request, res: Response) => {
  const { userId, activityName, activityDetail } = req.body;

  try {
    const id: string = generateId(activityName);

    const formData = {
      id,
      user_id: userId,
      activity_name: activityName,
      activity_detail: activityDetail,
    };

    const activity = await user.UserActivities.query().insert(formData);

    res.status(201).json(successResponseOld("SUCCESS", { results: activity }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponseOld(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponseOld("Internal server error", { results: null }));
    }
  }
};
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const activityId = req.params.id;
  const { userId, activityName, activityDetail } = req.body;

  try {
    const updated = await user.UserActivities.query().findById(activityId).patch({
      user_id: userId,
      activity_name: activityName,
      activity_detail: activityDetail,
    });

    if (updated) {
      const newData = await user.UserActivities.query()
        .select(
          "id",
          "user_id as userId",
          "activity_name as activityName",
          "activity_detail as activityDetail",
          "created_at as createdAt"
        )
        .findById(activityId);

      res.status(200).json(successResponseOld("UPDATED", { results: newData }));
    } else {
      res.status(404).json(errorResponseOld("DATA NOT FOUND", { results: null }));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponseOld(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponseOld("Internal server error", { results: null }));
    }
  }
};
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const activityId = req.params.id;

  try {
    const deleted = await user.UserActivities.query().deleteById(activityId);

    if (deleted) {
      res.status(200).json(successResponseOld("DELETED", { results: null }));
    } else {
      res.status(404).json(errorResponseOld("DATA NOT FOUND", { results: null }));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponseOld(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponseOld("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
