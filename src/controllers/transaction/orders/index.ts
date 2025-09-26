import { Request, Response } from "express";
import { transaction } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { generateId } from "@utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = transaction.Orders.querySoftDelete()
      .select(
        "orders.id",
        "orders.user_id as userId",
        "orders.booking_id as bookingId",
        "orders.phone",
        "orders.city_id as cityId",
        "orders.source",
        "orders.paid_at as paidAt",
        "orders.payment_type as paymentType"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(orders.booking_id) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(orders.phone) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(orders.source) LIKE ?", [`%${searchKeywords}%`]);
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
  const orderId = req.params.id;

  try {
    const order = await transaction.Orders.querySoftDelete()
      .select(
        "orders.id",
        "orders.user_id as userId",
        "orders.booking_id as bookingId",
        "orders.phone",
        "orders.city_id as cityId",
        "orders.source",
        "orders.paid_at as paidAt",
        "orders.payment_type as paymentType",
        "orders.deleted_at as deletedAt",
        "orders.created_at as createdAt"
      )
      .findById(orderId);

    if (order) {
      res.status(200).json(successResponse("SUCCESS", { results: order }));
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
  const { userId, bookingId, phone, cityId, source, paidAt, paymentType } = req.body;

  try {
    const id: string = generateId(bookingId);

    interface FormData {
      id: string;
      user_id: string;
      booking_id: string;
      phone: string;
      city_id: string;
      source?: string | null;
      paid_at?: string | null;
      payment_type?: string | null;
    }

    const formData = {
      id,
      user_id: userId,
      booking_id: bookingId,
      phone,
      city_id: Number(cityId), 
      source,
      paid_at: paidAt,
      payment_type: paymentType
    };
    
    const isOrderExist = await transaction.Orders.querySoftDelete().findOne({ booking_id: bookingId });

    if (isOrderExist) {
      res.status(409).json(errorResponse("Booking ID already exists", { results: null }));
    } else {
      const order = await transaction.Orders.query().insert(formData);
      res.status(201).json(successResponse("SUCCESS", { errors: null, results: order }));
    }
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
  const orderId = req.params.id;
  const { userId, bookingId, phone, cityId, source, paidAt, paymentType } = req.body;

  try {
    const updatedOrder = await transaction.Orders.querySoftDelete().findById(orderId).patch({
      user_id: userId,
      booking_id: bookingId,
      phone,
      city_id: cityId,
      source,
      paid_at: paidAt,
      payment_type: paymentType
    });

    const newData = await transaction.Orders.querySoftDelete().findById(orderId);

    res.status(200).json(
      successResponse("UPDATED", { results: newData })
    );
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
  const orderId = req.params.id;

  try {
    await transaction.Orders.softDelete(orderId);

    res.status(200).json(
      successResponse("DELETED", { results: null })
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
