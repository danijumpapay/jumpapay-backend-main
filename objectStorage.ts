import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const objectStorageAccessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID || "";
const objectStorageAccessKeySecret = process.env.OBJECT_STORAGE_ACCESS_KEY_SECRET || "";
const objectStorageEndpoint = process.env.OBJECT_STORAGE_PUBLIC_END_POINT || "";
const objectStorageRegion = process.env.S3_REGION || "sin1"

const bucketS3 = new S3Client({
  endpoint: objectStorageEndpoint,
  region: objectStorageRegion,
  credentials: {
    accessKeyId: objectStorageAccessKeyId,
    secretAccessKey: objectStorageAccessKeySecret,
  },
  forcePathStyle: true
});

export default bucketS3;