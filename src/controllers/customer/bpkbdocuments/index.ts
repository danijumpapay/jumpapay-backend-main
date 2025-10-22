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
    const rawQuery = customer.BpkbDocuments.querySoftDelete()
      .select(
        "bpkb_documents.id",
        "bpkb_documents.user_id as userId",
        "bpkb_documents.vehicle_id as vehicleId",
        "bpkb_documents.bpkb_number as bpkbNumber",
        "bpkb_documents.issue_date as issueDate",
        "bpkb_documents.registration_office as registrationOffice",
        "bpkb_documents.image",
        "bpkb_documents.is_active as isActive",
        "bpkb_documents.deleted_at as deletedAt",
        "bpkb_documents.created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.whereRaw("LOWER(bpkb_documents.bpkb_number) LIKE ?", [
            `%${searchKeywords}%`,
          ]);
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
  const documentId = req.params.id;

  try {
    const document = await customer.BpkbDocuments.querySoftDelete()
      .select(
        "bpkb_documents.id",
        "bpkb_documents.user_id as userId",
        "bpkb_documents.vehicle_id as vehicleId",
        "bpkb_documents.bpkb_number as bpkbNumber",
        "bpkb_documents.issue_date as issueDate",
        "bpkb_documents.registration_office as registrationOffice",
        "bpkb_documents.image",
        "bpkb_documents.is_active as isActive",
        "bpkb_documents.deleted_at as deletedAt",
        "bpkb_documents.created_at as createdAt"
      )
      .findById(documentId);

    if (document) {
      res.status(200).json(successResponseOld("SUCCESS", { results: document }));
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
  const { userId, vehicleId, bpkbNumber, issueDate, registrationOffice, image, isActive } =
    req.body;

  try {
    const id: string = generateId(bpkbNumber);

    interface FormData {
      id: string;
      user_id: string;
      vehicle_id: string;
      bpkb_number: string;
      issue_date: string;
      registration_office?: string | null;
      image?: string | null;
      is_active?: boolean;
    }

    const formData: FormData = {
      id,
      user_id: userId,
      vehicle_id: vehicleId,
      bpkb_number: bpkbNumber,
      issue_date: issueDate,
      registration_office: registrationOffice,
      image,
      is_active: isActive,
    };

    const document = await customer.BpkbDocuments.query().insert(formData);

    res.status(201).json(
      successResponseOld("SUCCESS", {
        errors: null,
        results: document,
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
  const documentId = req.params.id;

  const { userId, vehicleId, bpkbNumber, issueDate, registrationOffice, image, isActive } =
    req.body;

  try {
    const updated = await customer.BpkbDocuments.querySoftDelete().findById(documentId).patch({
      user_id: userId,
      vehicle_id: vehicleId,
      bpkb_number: bpkbNumber,
      issue_date: issueDate,
      registration_office: registrationOffice,
      image,
      is_active: isActive,
    });

    if (updated) {
      const newData = await customer.BpkbDocuments.query().findById(documentId);
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
  const documentId = req.params.id;

  try {
    await customer.BpkbDocuments.softDelete(documentId);

    res.status(200).json(successResponseOld("Deleted", { results: null }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponseOld(error?.message, { results: null }));
    } else {
      res.status(500).json(errorResponseOld("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
