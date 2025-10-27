import { uploadMedia } from "@utils/objectStorage";
import crypto from "crypto";

export const generateId = (name?: string): string => {
  const personName: string[] = (name || "Anonymous").split(" ");
  const prefixCode: string =
    personName[0].substring(0, 1).toUpperCase() +
    (personName[1] ? personName[1].substring(0, 1).toUpperCase() : "");
  const dateNow = new Date();
  const h: number = dateNow.getHours();
  const i: number = dateNow.getMinutes();
  const s: number = dateNow.getSeconds();
  const y: number = dateNow.getFullYear();
  const m: number = dateNow.getMonth() + 1;
  const d: number = dateNow.getDate();
  const rn: number[] = [...Array(4)].map(() => Math.floor(Math.random() * 10));
  const uniqId: string = prefixCode + s + d + h + m + i + y + rn[0] + rn[1] + rn[2] + rn[3];

  return uniqId;
};

export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const convertKeysToCamel = <T>(data: T): T => {
  return data;
  // if (Array.isArray(data)) {
  //   return data.map((item) => convertKeysToCamel(item)) as unknown as T;
  // } else if (data !== null && typeof data === "object") {
  //   return Object.keys(data).reduce((acc, key) => {
  //     const camelKey = snakeToCamel(key);
  //     (acc as any)[camelKey] = convertKeysToCamel((data as any)[key]);
  //     return acc;
  //   }, {} as any) as T;
  // }
  // return data;
};

export const uploadToS3 = async (file: Express.Multer.File) => {
  const originalName = file.originalname;
  const mimeType = file.mimetype;
  const ext = originalName.split(".").pop() || "";
  const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

  const s3Result = await uploadMedia(file.buffer, uniqueName, ext, mimeType);

  return {
    url: `https://s3.jumpapay.com/${s3Result.Key}`,
    filename: originalName,
  };
};

export const generateTokenString = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString("hex");
};

export const gmapsLink = (
  longitude: number | null = 0,
  latitude: number | null = 0
): string => {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
};
