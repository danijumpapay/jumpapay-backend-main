import { Request, Response } from "express";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { whatsapp } from "@jumpapay/jumpapay-models";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const merchantId = req.params.merchantId;
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = whatsapp.Whatsapp.query()
      .select(
        "whatsapp.id",
        "whatsapp.merchant_id as merchantId",
        "whatsapp.phone_id as phoneId",
        "whatsapp.phone",
        "whatsapp.name",
        "whatsapp.avatar",
      )
      .orderBy("whatsapp.name", "ASC")
      .where("whatsapp.merchant_id", merchantId)
      .where("whatsapp.is_active", true)
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
