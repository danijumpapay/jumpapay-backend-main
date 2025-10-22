import dotenv from "dotenv";
import { Upload } from "@aws-sdk/lib-storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import objectStorage from "@root/objectStorage";
import { Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

dotenv.config();

interface UploadOptions {
  fieldName: string;
  path: string;

  fileFilter?: (
    req: Request,
    file: Express.Multer.File,
    cb: import("multer").FileFilterCallback
  ) => void;
  fileSize?: number;
  multiple?: boolean;
  maxCount?: number;
}

const s3Bucket = process.env.OBJECT_STORAGE_BUCKET || "jumpapay-production";

export const uploadToStorage = async (
  bucket: string,
  fileBuffer: Buffer | Uint8Array | Blob | string,
  fileName: string,
  contentType: string
) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    const result = await objectStorage.send(command);
    return result;
  } catch (err) {
    throw err;
  }
};

export const uploadFile = async (
  buffer: Buffer,
  name: string,
  type: string,
  contentType: string
) => {
  const uploader = new Upload({
    client: objectStorage,
    params: {
      Bucket: s3Bucket,
      Key: `${name}.${type}`,
      Body: buffer,
      ContentType: contentType,
    },
  });

  try {
    const result = await uploader.done();
    return result;
  } catch (err) {
    throw err;
  }
};

export const uploadAvatar = (buffer: Buffer, name: string, type: string, contentType: string) => {
  return uploadFile(buffer, `jumpapay/avatar/${name}`, type, contentType);
};

export const uploadMedia = (buffer: Buffer, name: string, type: string, contentType: string) => {
  return uploadFile(buffer, `jumpapay/whatsapp-media/sent/${name}`, type, contentType);
};

export const setPublicMedia = (buffer: Buffer, name: string, type: string) => {};

export const uploadMiddleware = (options: UploadOptions) => {
  const {
    fieldName,
    path: s3Path,
    fileFilter,
    fileSize,
    multiple = false,
    maxCount = 10,
  } = options;

  const s3Storage = multerS3({
    s3: objectStorage,
    bucket: process.env.S3_BUCKET_NAME || "jumpapay",
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${s3Path}${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
  });

  const upload = multer({
    storage: s3Storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: fileSize || 1024 * 1024 * 5,
    },
  });

  if (multiple) {
    return upload.array(fieldName, maxCount);
  } else {
    return upload.single(fieldName);
  }
};
