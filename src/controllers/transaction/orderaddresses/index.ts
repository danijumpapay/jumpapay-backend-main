import { Request, Response } from "express";
import { transaction } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const type: string | null = req.query?.type ? String(req.query.type)?.toUpperCase() : null;

  try {
    const rawQuery = transaction.OrderAddresses.query()
      .select(
        "transaction.order_addresses.id",
        "transaction.order_addresses.order_id as orderId",
        "transaction.order_addresses.address_id as addressId",
        "transaction.order_addresses.price",
        "transaction.order_addresses.type"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (type !== null && type !== "") {
          queryBuilder.whereRaw("UPPER(type) = ?", [type]);
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
    const data = await transaction.OrderAddresses.query()
      .select(
        "transaction.order_addresses.id",
        "transaction.order_addresses.order_id as orderId",
        "transaction.order_addresses.address_id as addressId",
        "transaction.order_addresses.price",
        "transaction.order_addresses.type"
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
  const { orderId, addressId, price, type } = req.body;

  try {
    // const data = await transaction.OrderAddresses.query().insert({
    //   order_id: orderId,
    //   address_id: addressId,
    //   price,
    //   type,
    // });

    res.status(201).json(
      successResponse("Created Successfully", {
        errors: null,
        results: null,
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
  const { orderId, addressId, price } = req.body;

  try {
    const updated = await transaction.OrderAddresses.query().findById(id).patch({
      order_id: orderId,
      address_id: addressId,
      price,
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
    await transaction.OrderAddresses.query().deleteById(id);

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
