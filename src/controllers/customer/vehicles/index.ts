import { Request, Response } from "express";
import { customer } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponseOld, errorResponseOld } from "@utils/response";
import { generateId } from "@utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = customer.Vehicles.querySoftDelete()
      .select(
        "customer.vehicles.id",
        "customer.vehicles.user_id as userId",
        "customer.vehicles.vehicle_type_id as vehicleTypeId",
        "customer.vehicles.plate_id as plateId",
        "customer.vehicles.plate_number as plateNumber",
        "customer.vehicles.plate_serial as plateSerial",
        "customer.vehicles.brand",
        "customer.vehicles.model",
        "customer.vehicles.year_of_manufacture as yearOfManufacture",
        "customer.vehicles.color",
        "customer.vehicles.engine_number as engineNumber",
        "customer.vehicles.chassis_number as chassisNumber",
        "customer.vehicles.deleted_at as deletedAt",
        "customer.vehicles.created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((builder) => {
            builder
              .whereRaw("LOWER(customer.vehicles.plate_number) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(customer.vehicles.brand) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(customer.vehicles.model) LIKE ?", [`%${searchKeywords}%`]);
          });
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
  const vehicleId = req.params.id;

  try {
    const vehicle = await customer.Vehicles.querySoftDelete()
      .select(
        "customer.vehicles.id",
        "customer.vehicles.user_id as userId",
        "customer.vehicles.vehicle_type_id as vehicleTypeId",
        "customer.vehicles.plate_id as plateId",
        "customer.vehicles.plate_number as plateNumber",
        "customer.vehicles.plate_serial as plateSerial",
        "customer.vehicles.brand",
        "customer.vehicles.model",
        "customer.vehicles.year_of_manufacture as yearOfManufacture",
        "customer.vehicles.color",
        "customer.vehicles.engine_number as engineNumber",
        "customer.vehicles.chassis_number as chassisNumber",
        "customer.vehicles.deleted_at as deletedAt",
        "customer.vehicles.created_at as createdAt"
      )
      .findById(vehicleId);

    if (vehicle) {
      res.status(200).json(successResponseOld("SUCCESS", { results: vehicle }));
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
  const {
    userId,
    vehicleTypeId,
    plateId,
    plateNumber,
    plateSerial,
    brand,
    model,
    yearOfManufacture,
    color,
    engineNumber,
    chassisNumber,
  } = req.body;

  try {
    const id: string = generateId(plateNumber);

    interface FormData {
      id: string;
      user_id: string;
      vehicle_type_id: number;
      plate_id: number;
      plate_number: string;
      plate_serial?: string | null;
      brand: string;
      model: string;
      year_of_manufacture?: number | null;
      color: string;
      engine_number?: string | null;
      chassis_number?: string | null;
    }

    const formData: FormData = {
      id,
      user_id: userId,
      vehicle_type_id: Number(vehicleTypeId),
      plate_id: Number(plateId),
      plate_number: plateNumber,
      plate_serial: plateSerial || null,
      brand,
      model,
      year_of_manufacture: yearOfManufacture ? Number(yearOfManufacture) : null,
      color,
      engine_number: engineNumber || null,
      chassis_number: chassisNumber || null,
    };

    const vehicle = await customer.Vehicles.query().insert(formData);

    res.status(201).json(
      successResponseOld("SUCCESS", {
        errors: null,
        results: vehicle,
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponseOld(error?.message, {
          errors: null,
          results: null,
        })
      );
    } else {
      res.status(500).json(
        errorResponseOld("Internal server error", {
          errors: null,
          results: null,
        })
      );
    }
  }
};
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const vehicleId = req.params.id;
  const {
    userId,
    vehicleTypeId,
    plateId,
    plateNumber,
    plateSerial,
    brand,
    model,
    yearOfManufacture,
    color,
    engineNumber,
    chassisNumber,
  } = req.body;

  try {
    const updated = await customer.Vehicles.querySoftDelete().findById(vehicleId).patch({
      user_id: userId,
      vehicle_type_id: vehicleTypeId,
      plate_id: plateId,
      plate_number: plateNumber,
      plate_serial: plateSerial,
      brand,
      model,
      year_of_manufacture: yearOfManufacture,
      color,
      engine_number: engineNumber,
      chassis_number: chassisNumber,
    });

    if (updated) {
      const newData = await customer.Vehicles.querySoftDelete().findById(vehicleId);
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
  const vehicleId = req.params.id;

  try {
    const vehicle = await customer.Vehicles.querySoftDelete().findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json(errorResponseOld("DATA NOT FOUND", { results: null }));
    }

    await customer.Vehicles.softDelete(vehicleId);

    res.status(200).json(successResponseOld("DELETED", { results: null }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponseOld(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponseOld("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
