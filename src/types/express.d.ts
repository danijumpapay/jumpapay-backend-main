import { Request } from "express";
import { AccessTokenPayload } from "@dataTypes/general"; 

declare global {
  namespace Express {
    interface Request {
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
      currentUser?: AccessTokenPayload;
    }
  }
}
