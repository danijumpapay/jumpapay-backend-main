import { AccessTokenPayload } from "@dataTypes/general";

declare module 'express' {
  export interface Request {
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    currentUser?: AccessTokenPayload;
  }
}
