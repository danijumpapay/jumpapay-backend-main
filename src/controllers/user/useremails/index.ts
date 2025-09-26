import { Request, Response } from "express";
import { user } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = user.UserEmails.query()
      .select(
        "user_emails.id",
        "user_emails.user_id as userId",
        "user_emails.email",
        "user_emails.is_primary as isPrimary",
        "user_emails.verified_at as verifiedAt"
      )
      .from("user.user_emails")
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(user_emails.email) LIKE ?", [`%${searchKeywords}%`]);
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
  const id = req.params.id;

  try {
    const data = await user.UserEmails.query()
      .select(
        "user_emails.id",
        "user_emails.user_id as userId",
        "user_emails.email",
        "user_emails.is_primary as isPrimary",
        "user_emails.verified_at as verifiedAt"
      )
      .from("user.user_emails")
      .findById(id);

    if (data) {
      res.status(200).json(successResponse("SUCCESS", { results: data }));
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
  const { userId, email, isPrimary, verifiedAt } = req.body;

  try {
    const formData = {
      user_id: userId,
      email,
      is_primary: isPrimary,
      verified_at: verifiedAt
    };

    const data = await user.UserEmails.query().insert(formData);

    res.status(201).json(
      successResponse("Created Successfully", {
        errors: null,
        results: data
      })
    );
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
  const id = req.params.id;
  const { userId, email, isPrimary, verifiedAt } = req.body;

  try {
    const updated = await user.UserEmails.query().findById(id).patch({
      user_id: userId,
      email,
      is_primary: isPrimary,
      verified_at: verifiedAt
    });

    if (updated) {
      const newData = await user.UserEmails.query()
        .select(
          "user_emails.id",
          "user_emails.user_id as userId",
          "user_emails.email",
          "user_emails.is_primary as isPrimary",
          "user_emails.verified_at as verifiedAt"
        )
        .from("user.user_emails")
        .findById(id);

      res.status(200).json(successResponse("Updated Successfully", { results: newData }));
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
  const id = req.params.id;

  try {
    const deleted = await user.UserEmails.query().deleteById(id);

    if (deleted) {
      res.status(200).json(successResponse("Deleted Successfully", { results: null }));
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
//#endregion - deleteData
