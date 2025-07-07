import { Request, Response } from "express";
import StnkDocuments from "../../../models/customer/StnkDocuments.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";
import { generateId } from "../../../utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = StnkDocuments.querySoftDelete()
      .select(
        "customer.stnk_documents.id",
        "customer.stnk_documents.user_id as userId",
        "customer.stnk_documents.vehicle_id as vehicleId",
        "customer.stnk_documents.stnk_number as stnkNumber",
        "customer.stnk_documents.issue_date as issueDate",
        "customer.stnk_documents.expiry_date as expiryDate",
        "customer.stnk_documents.tax_due_date as taxDueDate",
        "customer.stnk_documents.is_active as isActive",
        "customer.stnk_documents.image",
        "customer.stnk_documents.deleted_at as deletedAt",
        "customer.stnk_documents.created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.whereRaw("LOWER(customer.stnk_documents.stnk_number) LIKE ?", [`%${searchKeywords}%`]);
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
  const stnkId = req.params.id;

  try {
    const stnk = await StnkDocuments.querySoftDelete()
      .select(
        "customer.stnk_documents.id",
        "customer.stnk_documents.user_id as userId",
        "customer.stnk_documents.vehicle_id as vehicleId",
        "customer.stnk_documents.stnk_number as stnkNumber",
        "customer.stnk_documents.issue_date as issueDate",
        "customer.stnk_documents.expiry_date as expiryDate",
        "customer.stnk_documents.tax_due_date as taxDueDate",
        "customer.stnk_documents.is_active as isActive",
        "customer.stnk_documents.image",
        "customer.stnk_documents.deleted_at as deletedAt",
        "customer.stnk_documents.created_at as createdAt"
      )
      .findById(stnkId);

    if (stnk) {
      res.status(200).json(
        successResponse("SUCCESS", { results: stnk })
      );
    } else {
      res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
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
  const {
    userId,
    vehicleId,
    stnkNumber,
    issueDate,
    expiryDate,
    taxDueDate,
    isActive,
    image
  } = req.body;

  try {
    const id: string = generateId(stnkNumber);

    interface FormData {
      id: string;
      user_id: string;
      vehicle_id: string;
      stnk_number: string;
      issue_date?: string | null;
      expiry_date?: string | null;
      tax_due_date?: string | null;
      is_active?: boolean;
      image?: string | null;
    }

    const formData: FormData = {
      id,
      user_id: userId,
      vehicle_id: vehicleId,
      stnk_number: stnkNumber,
      issue_date: issueDate,
      expiry_date: expiryDate,
      tax_due_date: taxDueDate,
      is_active: isActive,
      image
    };

    const stnk = await StnkDocuments.query().insert(formData);

    res.status(201).json(
      successResponse("SUCCESS", { errors: null, results: stnk })
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
  const stnkId = req.params.id;
  const {
    userId,
    vehicleId,
    stnkNumber,
    issueDate,
    expiryDate,
    taxDueDate,
    isActive,
    image
  } = req.body;

  try {
    const updated = await StnkDocuments.querySoftDelete()
      .findById(stnkId)
      .patch({
        user_id: userId,
        vehicle_id: vehicleId,
        stnk_number: stnkNumber,
        issue_date: issueDate,
        expiry_date: expiryDate,
        tax_due_date: taxDueDate,
        is_active: isActive,
        image
      });

    if (updated) {
      const newData = await StnkDocuments.querySoftDelete().findById(stnkId);
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
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const stnkId = req.params.id;

  try {
    const stnk = await StnkDocuments.querySoftDelete().findById(stnkId);

    if (!stnk) {
      return res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
    }

    await StnkDocuments.softDelete(stnkId);

    res.status(200).json(
      successResponse("DELETED", { results: null })
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
