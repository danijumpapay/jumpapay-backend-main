import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { uploadMiddleware as s3UploadFactory } from "@utils/objectStorage";
import { Request } from "express";
import { BadRequestError } from "@utils/errors";
import bucketS3 from "@root/objectStorage";

const uploadFolder = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const blockedExtensions = [
  ".php",
  ".php3",
  ".php4",
  ".php5",
  ".phtml",
  ".phar",
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".com",
  ".scr",
  ".msi",
  ".sql",
  ".sqlite",
  ".db",
  ".bak",
  ".js",
  ".jsp",
  ".asp",
  ".aspx",
  ".cgi",
  ".html",
  ".htm",
];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (blockedExtensions.includes(ext)) {
      return cb(new Error(`Files of type ${ext} are not allowed`));
    }
    cb(null, true);
  },
});

const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Validation error: Only image files are allowed."));
  }
};

const documentFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Validation error: Only PDF or Word documents are allowed."));
  }
};

const PATHS = {
  avatars: "uploads/avatars/",
  documents: "uploads/documents/",
  evidence: "uploads/evidence/",
  vehicleImages: "uploads/vehicles/",
};

const createS3Storage = (options: {
  path: string;
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => void;
  fileSize?: number;
}) => {
  return multer({
    storage: multerS3({
      s3: bucketS3,
      bucket: process.env.S3_BUCKET_NAME || "jumpapay",
      acl: "public-read",
      key: (req, file, cb) => {
        const fileName = `${options.path}${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, fileName);
      },
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
    }),
    fileFilter: options.fileFilter,
    limits: {
      fileSize: options.fileSize || 1024 * 1024 * 5,
    },
  });
};

export const uploadAvatar = createS3Storage({
  path: PATHS.avatars,
  fileFilter: imageFileFilter,
  fileSize: 1024 * 1024 * 2,
});

export const uploadDocument = createS3Storage({
  path: PATHS.documents,
  fileFilter: documentFileFilter,
  fileSize: 1024 * 1024 * 10,
});

export const uploadVehicleImage = createS3Storage({
  path: PATHS.vehicleImages,
  fileFilter: imageFileFilter,
  fileSize: 1024 * 1024 * 5,
});

export const uploadEvidenceFile = createS3Storage({
  path: PATHS.evidence,
  fileFilter: imageFileFilter,
  fileSize: 1024 * 1024 * 5,
});

export const uploadMultipleVehicleImages = createS3Storage({
  path: PATHS.vehicleImages,
  fileFilter: imageFileFilter,
  fileSize: 1024 * 1024 * 5,
}).array("images", 5);

export const uploadMultipleEvidenceFiles = createS3Storage({
  path: PATHS.evidence,
  fileFilter: imageFileFilter,
  fileSize: 1024 * 1024 * 5,
}).array("files", 3);
