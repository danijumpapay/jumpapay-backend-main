// src/types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

// Multer 'single'
// declare global {
//   namespace Express {
//     interface Request {
//       file?: Express.Multer.File;
//     }
//   }
// }