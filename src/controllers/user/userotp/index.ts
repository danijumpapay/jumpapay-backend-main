import { Request, Response } from "express";
import MUserOtp from "../../../models/user/UserOtp.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = MUserOtp.query()
      .select(
        "user_otp.id",
        "user_otp.user_id",
        "user_otp.name",
        "user_otp.code",
        "user_otp.expired_at as expiredAt",
        "user_otp.created_at as createdAt"
      )
      .from("user.user_otp")
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(user_otp.name) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(user_otp.code) LIKE ?", [`%${searchKeywords}%`]);
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
    const otp = await MUserOtp.query()
      .select(
        "user_otp.id",
        "user_otp.user_id",
        "user_otp.name",
        "user_otp.code",
        "user_otp.expired_at as expiredAt",
        "user_otp.created_at as createdAt"
      )
      .from("user.user_otp")
      .findById(id);

    if (otp) {
      res.status(200).json(successResponse("SUCCESS", { results: otp }));
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
//#region - detailData

//#region - createData
export const createData = async (req: Request, res: Response) => {
  const { user_id, name, code, expired_at } = req.body;

  try {
    const data = await MUserOtp.query().insert({
      user_id,
      name,
      code,
      expired_at
    });

    res.status(201).json(
      successResponse("Created Successfully", {
        errors: null,
        results: data
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
  const { name, code, expired_at } = req.body;

  try {
    const updated = await MUserOtp.query().findById(id).patch({
      name,
      code,
      expired_at
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
    await MUserOtp.query().deleteById(id);

    res.status(200).json(successResponse("Deleted Successfully", { results: null }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
