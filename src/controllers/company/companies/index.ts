import { Request, Response } from "express";
import { company } from "@jumpapay/jumpapay-models";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { generateId } from "@utils/helpers";

//#region - listData
export const listData = async (req: Request, res: Response) => {
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = company.Companies.query()
      .select(
        "id",
        "user_id as userId",
        "name",
        "description",
        "pic",
        "logo",
        "longitude",
        "latitude",
        "address",
        "email"
      )
      .page(page - 1, limit)
      .modify((queryBuilder) => {
        if (searchKeywords !== null && searchKeywords !== "") {
          queryBuilder.whereRaw("LOWER(name) LIKE ?", [`%${searchKeywords}%`]);
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
  const companyId = req.params.id;

  try {
    const results = await company.Companies.query()
      .select(
        "id",
        "user_id as userId",
        "name",
        "description",
        "pic",
        "logo",
        "longitude",
        "latitude",
        "address",
        "email"
      )
      .findById(companyId);

    if (results) {
      res.status(200).json(successResponse("SUCCESS", { results: results }));
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
  const { userId, name, description, pic, logo, longitude, latitude, address, email } = req.body;

  try {
    const id = generateId(name);

    const isExist = await company.Companies.query().findById(id);

    if (isExist) {
      res.status(409).json(errorResponse("Company ID already exists", { results: null }));
    } else {
      const formData = {
        id,
        user_id: userId,
        name,
        description,
        pic,
        logo,
        longitude,
        latitude,
        address,
        email
      };

      const results = await company.Companies.query().insert(formData);

      res.status(201).json(
        successResponse("SUCCESS", {
          errors: null,
          results: results
        })
      );
    }
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
  const companyId = req.params.id;
  const { userId, name, description, pic, logo, longitude, latitude, address, email } = req.body;

  try {
    const updated = await company.Companies.query().findById(companyId).patch({
      user_id: userId,
      name,
      description,
      pic,
      logo,
      longitude,
      latitude,
      address,
      email
    });

    if (updated) {
      const newData = await company.Companies.query()
        .select(
          "id",
          "user_id as userId",
          "name",
          "description",
          "pic",
          "logo",
          "longitude",
          "latitude",
          "address",
          "email"
        )
        .findById(companyId);

      res.status(200).json(successResponse("UPDATED", { results: newData }));
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
  const companyId = req.params.id;

  try {
    const deleted = await company.Companies.query().deleteById(companyId);

    if (deleted) {
      res.status(200).json(successResponse("DELETED", { results: null }));
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
//#endregion - deleteData
