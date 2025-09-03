import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const objectStorageAccessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID || "";
const objectStorageAccessKeySecret = process.env.OBJECT_STORAGE_ACCESS_KEY_SECRET || "";
const objectStorageEndpoint = process.env.OBJECT_STORAGE_END_POINT || "";
const bucketS3 = new AWS.S3({
  accessKeyId: objectStorageAccessKeyId,
  secretAccessKey: objectStorageAccessKeySecret,
  endpoint: objectStorageEndpoint,
  s3BucketEndpoint: true,
});

export default bucketS3;