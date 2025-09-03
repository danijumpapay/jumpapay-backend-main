import dotenv from "dotenv";
import objectStorage from "@root/objectStorage";
dotenv.config();
const s3Bucket = process.env.OBJECT_STORAGE_BUCKET || "jumpapay-production";

export const uploadToStorage = async (
  bucket: string,
  fileBuffer: string,
  fileName: string,
  contentType: string
) => {
  return new Promise((resolve, reject) => {
    objectStorage.putObject({
      Body: fileBuffer,
      Bucket: bucket,
      Key: fileName,
      ContentType: contentType
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const uploadFile = (
  buffer: Buffer,
  name: string,
  type: string,
  contentType: string
) => {
  const params = {
    Body: buffer,
    Bucket: s3Bucket,
    Key: `${name}.${type}`,
    ContentType: contentType,
  };

  return objectStorage.upload(params).promise();
};

export const uploadAvatar = (
  buffer: Buffer,
  name: string,
  type: string,
  contentType: string
) => {
  return uploadFile(buffer, `jumpapay/avatar/${name}`, type, contentType);
};

export const uploadMedia = (
  buffer: Buffer,
  name: string,
  type: string,
  contentType: string
) => {
  return uploadFile(buffer, `jumpapay/whatsapp-media/sent/${name}`, type, contentType);
};

export const setPublicMedia = (buffer: Buffer, name: string, type: string) => {
  // objectStorage.send(
  //   new PutObjectAclCommand({
  //     Bucket: bucketName,
  //     Key: key,
  //     ACL: "public-read",
  //   })
  // );
};