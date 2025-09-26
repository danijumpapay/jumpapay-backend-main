import { Request, Response } from "express";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { whatsapp } from "@jumpapay/jumpapay-models";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;

  try {
    const rawQuery = whatsapp.Merchants.query()
      .select(
        "merchants.id",
        "merchants.name",
        "merchants.icon",
        "merchants.description",
        "merchants.created_by as createdBy",
        "merchants.created_at as createdAt",
      )
      .orderBy("merchants.name", "ASC")
      .whereNull("merchants.deleted_at")
      .page(page - 1, limit);

    const { total, results } = await rawQuery;

    let totalData = total;
    res.status(200).json(
      successResponse("SUCCESS", {
        results: {
          pagination: paginationResponse(page, limit, totalData),
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
