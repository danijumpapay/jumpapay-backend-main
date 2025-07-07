import { Request, Response } from "express";
import CompanyEmployees from "../../../models/company/CompanyEmployees.model";
import { paginationResponse, successResponse, errorResponse } from "../../../utils/response";
import { generateId } from "../../../utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const role: string | null = req.query?.role ? String(req.query.role)?.toUpperCase() : null;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = CompanyEmployees.query()
      .select(
        "company_employees.id",
        "company_employees.user_id as userId",
        "company_employees.company_id as companyId",
        "company_employees.role"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.whereRaw("LOWER(company_employees.role) LIKE ?", [`%${searchKeywords}%`]);
        }
      });

    if (role) rawQuery.whereRaw("UPPER(company_employees.role) = ?", [role]);

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
  const employeeId = req.params.id;

  try {
    const employee = await CompanyEmployees.query()
      .select(
        "company_employees.id",
        "company_employees.user_id as userId",
        "company_employees.company_id as companyId",
        "company_employees.role"
      )
      .findById(employeeId);

    if (employee) {
      res.status(200).json(
        successResponse("SUCCESS", { results: employee })
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
  const { userId, companyId, role } = req.body;

  try {
    const id: string = generateId(role);
    const upperRole: string = role?.toUpperCase();

    if (!["ADMIN", "CS", "SUPERVISOR"].includes(upperRole)) {
      return res.status(400).json(
        errorResponse("Invalid role", { results: null })
      );
    }

    const formData = {
      id,
      user_id: userId,
      company_id: companyId,
      role: upperRole as "ADMIN" | "CS" | "SUPERVISOR"
    };

    const employee = await CompanyEmployees.query().insert(formData);

    res.status(201).json(
      successResponse("SUCCESS", {
        errors: null,
        results: employee
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
  const employeeId = req.params.id;
  const { userId, companyId, role } = req.body;

  try {
    const upperRole: string = role?.toUpperCase();

    if (!["ADMIN", "CS", "SUPERVISOR"].includes(upperRole)) {
      return res.status(400).json(
        errorResponse("Invalid role", { results: null })
      );
    }

    const employee = await CompanyEmployees.query().findById(employeeId).patch({
      user_id: userId,
      company_id: companyId,
      role: upperRole as "ADMIN" | "CS" | "SUPERVISOR"
    });

    res.status(200).json(
      successResponse("UPDATED", { results: employee })
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
//#endregion - updateData

//#region - deleteData
export const deleteData = async (req: Request, res: Response) => {
  const employeeId = req.params.id;

  try {
    await CompanyEmployees.query().deleteById(employeeId);

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
