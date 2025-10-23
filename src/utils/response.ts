import { Response, NextFunction, Request } from "express";
import { convertKeysToCamel } from "./helpers";

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  pageCount: number;
  currentPage: number;
}

interface SuccessResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}

interface PaginationResponse {
  page: number;
  next: number;
  prev: number;
  limit: number;
  totalPage: number;
  totalData: number;
}

interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string | null;
  userData?: object | null;
}

interface NoAccessResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}

export const successResponseOld = (message: string, results: object): SuccessResponse => {
  const response: SuccessResponse = {
    success: true,
    message: message,
    ...results,
  };

  return response;
};

export const errorResponseOld = (message: string, results?: object): ErrorResponse => {
  const response: ErrorResponse = {
    success: false,
    message: message,
    ...results,
  };

  return response;
};

export const paginationResponse = (
  page: number,
  limit: number,
  totalData: number
): PaginationResponse => {
  const response: PaginationResponse = {
    page,
    next: page + 1,
    prev: page < 1 ? page : page - 1,
    limit: limit,
    totalPage: Math.ceil(totalData / limit),
    totalData: totalData,
  };

  return response;
};

export const authResponse = (
  status: boolean,
  message: string,
  token?: string,
  user?: object
): AuthResponse => {
  return {
    success: status,
    message: message,
    accessToken: token,
    userData: user,
  };
};

export const noAccess = (results: object): NoAccessResponse => {
  const response: NoAccessResponse = {
    success: false,
    message: "You do not have access to this endpoint",
    ...results,
  };

  return response;
};

export const successResponse = (res: Response, statusCode: number, data: any, message?: string) => {
  const responseBody: any = {
    success: true,
    message: message || "Operation successful",
  };

  if (data !== null && data !== undefined) {
    responseBody.data = data;
  }

  res.status(statusCode).json(convertKeysToCamel(responseBody));
};

export const successListResponse = (
  res: Response,
  statusCode: number,
  data: any[],
  total: number,
  limit: number,
  offset: number,
  message?: string
) => {
  const responseBody: any = {
    success: true,
    message: message || "Data retrieved successfully",
    data: data,
  };

  const pageCount = limit > 0 ? Math.ceil(total / limit) : total > 0 ? 1 : 0;
  const currentPage = limit > 0 ? Math.floor(offset / limit) + 1 : 1;
  responseBody.pagination = {
    total,
    limit,
    offset,
    pageCount,
    currentPage,
  };

  res.status(statusCode).json(convertKeysToCamel(responseBody));
};

export const errorResponse = (res: Response, statusCode: number, message: string, errors?: any) => {
  const responseBody: any = {
    success: false,
    message: message,
  };
  if (errors) {
    responseBody.errors = errors;
  }
  res.status(statusCode).json(responseBody);
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message || err);
  if (err.errors) {
    console.error("Validation Details:", err.errors);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  errorResponse(res, statusCode, message, err.errors);
};
