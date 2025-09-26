import { Request, Response } from "express";
import { customer } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { generateId } from "@utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = customer.Addresses.querySoftDelete()
      .select(
        "id",
        "user_id as userId",
        "city_id as cityId",
        "name",
        "address_type as addressType",
        "province",
        "raw_address as rawAddress",
        "longitude",
        "latitude",
        "postcode",
        "is_pickup_address as isPickupAddress",
        "is_return_address as isReturnAddress",
        "created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(name) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(province) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(raw_address) LIKE ?", [`%${searchKeywords}%`]);
          })
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
  const addressId = req.params.id;

  try {
    const address = await customer.Addresses.querySoftDelete()
      .select(
        "id",
        "user_id as userId",
        "city_id as cityId",
        "name",
        "address_type as addressType",
        "province",
        "raw_address as rawAddress",
        "longitude",
        "latitude",
        "postcode",
        "is_pickup_address as isPickupAddress",
        "is_return_address as isReturnAddress",
        "created_at as createdAt"
      )
      .findById(addressId);

    if (address) {
      res.status(200).json(successResponse("SUCCESS", { results: address }));
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
    cityId,
    name,
    addressType,
    province,
    rawAddress,
    longitude,
    latitude,
    postcode,
    isPickupAddress,
    isReturnAddress
  } = req.body;

  try {
    const id: string = generateId(name);

    const formData = {
      id,
      user_id: userId,
      city_id: Number(cityId), // harus dikonversi ke number
      name,
      address_type: addressType,
      province,
      raw_address: rawAddress,
      longitude,
      latitude,
      postcode,
      is_pickup_address: isPickupAddress,
      is_return_address: isReturnAddress
    };

    const address = await customer.Addresses.query().insert(formData);

    res.status(201).json(successResponse("SUCCESS", { results: address }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const addressId = req.params.id;

  const {
    userId,
    cityId,
    name,
    addressType,
    province,
    rawAddress,
    longitude,
    latitude,
    postcode,
    isPickupAddress,
    isReturnAddress
  } = req.body;

  try {
    const updated = await customer.Addresses.query()
      .findById(addressId)
      .patch({
        user_id: userId,
        city_id: Number(cityId), // pastikan diubah jadi number
        name,
        address_type: addressType,
        province,
        raw_address: rawAddress,
        longitude,
        latitude,
        postcode,
        is_pickup_address: isPickupAddress,
        is_return_address: isReturnAddress
      });

    if (updated) {
      const newData = await customer.Addresses.query().findById(addressId);
      res.status(200).json(successResponse("UPDATED", { results: newData }));
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
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const addressId = req.params.id;

  try {
    await customer.Addresses.softDelete(addressId);
    res.status(200).json(successResponse("DELETED", { results: null }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
