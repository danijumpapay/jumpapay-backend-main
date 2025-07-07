import { Request, Response } from "express";
import CompanyWhatsapp from "../../../models/company/CompanyWhatsapp.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";
import { generateId } from "../../../utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = CompanyWhatsapp.querySoftDelete()
      .select(
        "id",
        "company_id as companyId",
        "phone_id as phoneId",
        "wab_id as wabId",
        "phone",
        "name",
        "avatar",
        "address",
        "email",
        "website",
        "description",
        "access_token as accessToken",
        "webhook",
        "webhook_token as webhookToken",
        "is_active as isActive",
        "created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(phone) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(name) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(phone_id) LIKE ?", [`%${searchKeywords}%`]);
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

//#region - detailData
export const detailData = async (req: Request, res: Response) => {
  const whatsappId = req.params.id;

  try {
    const whatsapp = await CompanyWhatsapp.querySoftDelete()
      .select(
        "id",
        "company_id as companyId",
        "phone_id as phoneId",
        "wab_id as wabId",
        "phone",
        "name",
        "avatar",
        "address",
        "email",
        "website",
        "description",
        "access_token as accessToken",
        "webhook",
        "webhook_token as webhookToken",
        "is_active as isActive",
        "deleted_at as deletedAt",
        "created_at as createdAt",
        "updated_at as updatedAt"
      )
      .findById(whatsappId);

    if (whatsapp) {
      res.status(200).json(
        successResponse("SUCCESS", { results: whatsapp })
      );
    } else {
      res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
    }
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
//#endregion - detailData

//#region - createData
export const createData = async (req: Request, res: Response) => {
  const {
    companyId,
    phoneId,
    wabId,
    phone,
    name,
    avatar,
    address,
    email,
    website,
    description,
    accessToken,
    webhook,
    webhookToken,
    isActive
  } = req.body;

  try {
    const id: string = generateId(name || "name");

    interface FormData {
      id: string;
      company_id: string;
      phone_id: string;
      wab_id: string;
      phone: string;
      name?: string | null;
      avatar?: string | null;
      address?: string | null;
      email?: string | null;
      website?: string | null;
      description?: string | null;
      access_token?: string | null;
      webhook?: string | null;
      webhook_token?: string | null;
      is_active?: boolean;
    }

    const formData: FormData = {
      id,
      company_id: companyId,
      phone_id: phoneId,
      wab_id: wabId,
      phone,
      name,
      avatar,
      address,
      email,
      website,
      description,
      access_token: accessToken,
      webhook,
      webhook_token: webhookToken,
      is_active: isActive
    };

    const isWhatsappExist = await CompanyWhatsapp.querySoftDelete().findOne({ phone });

    if (isWhatsappExist) {
      res.status(409).json(
        errorResponse("Phone already exists", { results: null })
      );
    } else {
      const whatsapp = await CompanyWhatsapp.query().insert(formData);

      res.status(201).json(
        successResponse("SUCCESS", {
          errors: null,
          results: whatsapp
        })
      );
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
  const whatsappId = req.params.id;
  const {
    companyId,
    phoneId,
    wabId,
    phone,
    name,
    avatar,
    address,
    email,
    website,
    description,
    accessToken,
    webhook,
    webhookToken,
    isActive
  } = req.body;

  try {
    const whatsapp = await CompanyWhatsapp.querySoftDelete()
      .findById(whatsappId)
      .patch({
        company_id: companyId,
        phone_id: phoneId,
        wab_id: wabId,
        phone,
        name,
        avatar,
        address,
        email,
        website,
        description,
        access_token: accessToken,
        webhook,
        webhook_token: webhookToken,
        is_active: isActive
      });

    if (whatsapp) {
      const updatedWhatsapp = await CompanyWhatsapp.querySoftDelete().findById(whatsappId);

      res.status(200).json(
        successResponse("UPDATED", { results: updatedWhatsapp })
      );
    } else {
      res.status(404).json(
        errorResponse("DATA NOT FOUND", { results: null })
      );
    }
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
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const whatsappId = req.params.id;

  try {
    await CompanyWhatsapp.softDelete(whatsappId);

    res.status(200).json(
      successResponse("Deleted", { results: null })
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
//#endregion - deleteData
