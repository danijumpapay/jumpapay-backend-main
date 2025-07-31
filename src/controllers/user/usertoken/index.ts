import { Request, Response } from "express";
import UserTokens from "../../../models/user/UserTokens.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";
import { generateId } from "../../../utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = UserTokens.query()
      .select(
        "id",
        "user_id as userId",
        "name",
        "device",
        "browser",
        "ip",
        "location",
        "token",
        "expired_at as expiredAt",
        "is_expired as isExpired",
        "created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(name) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(device) LIKE ?", [`%${searchKeywords}%`]);
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
  const tokenId = req.params.id;

  try {
    const token = await UserTokens.query()
      .select(
        "id",
        "user_id as userId",
        "name",
        "device",
        "browser",
        "ip",
        "location",
        "token",
        "expired_at as expiredAt",
        "is_expired as isExpired",
        "created_at as createdAt"
      )
      .findById(tokenId);

    if (token) {
      res.status(200).json(successResponse("SUCCESS", { results: token }));
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
  const {
    userId,
    name,
    device,
    browser,
    ip,
    location,
    token,
    expiredAt,
    isExpired
  } = req.body;

  try {
    const id: string = generateId(userId);

    interface FormData {
      id: string;
      user_id: string;
      name: string;
      device: string;
      browser: string;
      ip: string;
      location: string;
      token: string;
      expired_at: string;
      is_expired: boolean;
    }

    const formData: FormData = {
      id,
      user_id: userId,
      name,
      device,
      browser,
      ip,
      location,
      token,
      expired_at: expiredAt,
      is_expired: isExpired
    };

    const userToken = await UserTokens.query().insert(formData);

    res.status(201).json(
      successResponse("SUCCESS", { results: userToken })
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
  const tokenId = req.params.id;
  const {
    userId,
    name,
    device,
    browser,
    ip,
    location,
    token,
    expiredAt,
    isExpired
  } = req.body;

  try {
    const updated = await UserTokens.query()
      .findById(tokenId)
      .patch({
        user_id: userId,
        name,
        device,
        browser,
        ip,
        location,
        token,
        expired_at: expiredAt,
        is_expired: isExpired
      });

    if (updated) {
      const newData = await UserTokens.query()
        .select(
          "id",
          "user_id as userId",
          "name",
          "device",
          "browser",
          "ip",
          "location",
          "token",
          "expired_at as expiredAt",
          "is_expired as isExpired",
          "created_at as createdAt"
        )
        .findById(tokenId);

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
  const tokenId = req.params.id;

  try {
    const deleted = await UserTokens.query().deleteById(tokenId);

    if (deleted) {
      res.status(200).json(
        successResponse("DELETED", { results: null })
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
//#endregion - deleteData
