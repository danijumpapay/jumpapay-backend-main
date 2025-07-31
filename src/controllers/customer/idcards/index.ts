import { Request, Response } from "express";
import IdCards from "../../../models/customer/IdCards.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";
import { generateId } from "../../../utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = IdCards.querySoftDelete()
      .select(
        "customer.id_cards.id",
        "customer.id_cards.user_id as userId",
        "customer.id_cards.nik",
        "customer.id_cards.gender",
        "customer.id_cards.job",
        "customer.id_cards.blood_type as bloodType",
        "customer.id_cards.religion",
        "customer.id_cards.image",
        "customer.id_cards.created_at as createdAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(customer.id_cards.nik) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(customer.id_cards.job) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(customer.id_cards.religion) LIKE ?", [`%${searchKeywords}%`]);
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
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - listData

//#region - detailData
export const detailData = async (req: Request, res: Response) => {
  const idCardId = req.params.id;

  try {
    const idCard = await IdCards.querySoftDelete()
      .select(
        "customer.id_cards.id",
        "customer.id_cards.user_id as userId",
        "customer.id_cards.nik",
        "customer.id_cards.gender",
        "customer.id_cards.job",
        "customer.id_cards.blood_type as bloodType",
        "customer.id_cards.religion",
        "customer.id_cards.image",
        "customer.id_cards.created_at as createdAt",
        "customer.id_cards.deleted_at as deletedAt"
      )
      .findById(idCardId);

    if (idCard) {
      res.status(200).json(successResponse("SUCCESS", { results: idCard }));
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
  const { userId, nik, gender, job, bloodType, religion, image } = req.body;

  try {
    const id: string = generateId(userId);

    const validateGender = (gender: string | null | undefined): "MALE" | "FEMALE" | null => {
      if (!gender) return null;

      const upperGender = gender.toUpperCase();
      if (upperGender === "MALE" || upperGender === "FEMALE") return upperGender as "MALE" | "FEMALE";

      return null;
    };

    const formData = {
      id,
      user_id: userId,
      nik,
      gender: validateGender(gender),
      job,
      blood_type: bloodType,
      religion,
      image,
    };

    const idCard = await IdCards.query().insert(formData);

    res.status(201).json(
      successResponse("SUCCESS", {
        errors: null,
        results: idCard
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error.message, { errors: null, results: null })
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
  const idCardId = req.params.id;
  const { userId, nik, gender, job, bloodType, religion, image } = req.body;

  try {
    const validateGender = (gender: string | null | undefined): "MALE" | "FEMALE" | null => {
      if (!gender) return null;

      const upperGender = gender.toUpperCase();
      if (upperGender === "MALE" || upperGender === "FEMALE") return upperGender as "MALE" | "FEMALE";

      return null;
    };

    const updated = await IdCards.querySoftDelete()
      .findById(idCardId)
      .patch({
        user_id: userId,
        nik,
        gender: validateGender(gender),
        job,
        blood_type: bloodType,
        religion,
        image,
      });

    if (updated) {
      res.status(200).json(successResponse("UPDATED", { results: updated }));
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
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const idCardId = req.params.id;

  try {
    await IdCards.softDelete(idCardId);

    res.status(200).json(successResponse("Deleted", { results: null }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(errorResponse(error.message, { results: null }));
    } else {
      res.status(500).json(errorResponse("Internal server error", { results: null }));
    }
  }
};
//#endregion - deleteData
