import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { user } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { generateId } from "@utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const role: string | null = req.query?.role ? String(req.query.role)?.toUpperCase() : null;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = user.Users.querySoftDelete()
      .select(
        "users.id",
        "users.name",
        "users.username",
        "users.phone",
        "users.avatar",
        "users.role",
        "users.is_reviewer as isReviewer",
        "users.is_active as isActive",
        "users.verified_at as verifiedAt"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.where((qb) => {
            qb.whereRaw("LOWER(users.name) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(users.username) LIKE ?", [`%${searchKeywords}%`])
              .orWhereRaw("LOWER(users.phone) LIKE ?", [`%${searchKeywords}%`]);
          })
        }
      });

      if (role) rawQuery.whereRaw("UPPER(users.role) = ?", [role]);

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

//#region - detailData
  export const detailData = async (req: Request, res: Response) => {
    const userId = req.params.id;
  
    try {
      const data = await user.Users.querySoftDelete()
        .select(
          "users.id",
          "users.name",
          "users.alias",
          "users.username",
          "users.password",
          "users.avatar",
          "users.about",
          "users.role",
          "users.phone",
          "users.is_reviewer as isReviewer",
          "users.is_active as isActive",
          "users.verified_at as isVerified",
          "users.deleted_at as deletedAt",
          "users.created_at as createdAt",
          "users.updated_at as updatedAt"
        )
        .findById(userId);
  
        if (data) {
          res.status(200).json(
            successResponse("SUCCESS", { results: data })
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
//#endregion - listData

//#region - createData
export const createData = async (req: Request, res: Response) => {
  const {
    name,
    alias,
    username,
    password,
    avatar,
    about,
    phone,
    role,
    isReviewer,
    isActive,
  } = req.body;

  try {
    const id: string = generateId(name);
    const hashedPassword: string = await bcrypt.hash(password, 13);

    interface FormData {
      id: string;
      name: string;
      alias?: string | null;
      username?: string | null;
      password?: string | null;
      avatar?: string | null;
      about?: string | null;
      role?: "GOD" | "SUPERUSER" | "ADMIN" | "VIP" | "CUSTOMER";
      phone: string;
      isReviewer?: boolean;
      isActive?: boolean;
      verifiedAt?: string | null;
    }

    const formData: FormData = {
      id,
      name,
      alias,
      username,
      password: hashedPassword,
      about,
      phone,
      isReviewer,
      isActive,
    };

    
    if (avatar) formData["avatar"] = avatar;
    if (role) formData["role"] = role || "USER";

    const isUserExist = await user.Users.querySoftDelete().findOne({"users.phone": phone});

    if (isUserExist) {
      res.status(409).json(
        errorResponse("Phone already exists", { results: null })
      );
    } else {
      const data = await user.Users.query().insert(formData);
      const { password, verified_at, is_active, is_reviewer, ...rest } = data;
      const updatedUser = { ...rest, isVerified: verified_at, isActive: is_active, isReviewer: is_reviewer };
      
      res.status(201).json(
        successResponse("Success", {
          errors: null,
          results: updatedUser
        })
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error?.message, {
          errors: null,
          results: null
        })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", {
          errors: null,
          results: null
        })
      );
    }
  }
};
//#endregion - createData

//#region - updateData
export const updateData = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const {
    name,
    phone,
    username,
    alias,
    avatar,
    about,
    role,
    isReviewer,
    isActive,
    password,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const data = await user.Users.querySoftDelete().findById(userId).patch({
      name,
      phone,
      username,
      alias,
      avatar,
      about,
      role: role as any,
      is_reviewer: isReviewer,
      is_active: isActive,
      password: hashedPassword,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    await user.Users.softDelete(userId);

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