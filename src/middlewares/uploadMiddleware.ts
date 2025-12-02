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

const orderDocumentFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (blockedExtensions.includes(ext)) {
    return cb(new BadRequestError(`Validation error: Files of type ${ext} are not allowed`));
  }

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Validation error: Only images (JPEG/PNG), PDF, or Word documents are allowed."));
  }
};

const PATHS = {
  avatars: "avatar/",
  documents: "orders/documents/",
  evidence: "orders/evidence/",
  vehicleImages: "vehicles/",
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

export const uploadS3OrderFiles = createS3Storage({
  path: PATHS.documents,
  fileFilter: orderDocumentFileFilter,
  fileSize: 1024 * 1024 * 10,
}).fields([
  { name: 'ktpFile', maxCount: 1 },
  { name: 'stnkFile', maxCount: 1 },
  { name: 'bpkbFile', maxCount: 1 },
  { name: 'skpdFile', maxCount: 1 },
]);

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}${fileExt}`);
  },
});

export const uploadLocalDisk = multer({
  storage: diskStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (blockedExtensions.includes(ext)) {
      return cb(new Error(`Files of type ${ext} are not allowed`));
    }
    cb(null, true);
  },
});

export const uploadLocalOrderFiles = uploadLocalDisk.fields([
  { name: 'ktpFile', maxCount: 1 },
  { name: 'stnkFile', maxCount: 1 },
  { name: 'bpkbFile', maxCount: 1 },
  { name: 'skpdFile', maxCount: 1 },
]);