import { Request, Response } from "express";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { convertKeysToCamel, uploadToS3 } from "@utils/helpers";
import crypto from "crypto";
import axiosInstance, { whatsappMiddlewareInstance } from "@config/axios";
import { AxiosInstance } from "axios";
import { whatsapp as whatsappSchema } from "@jumpapay/jumpapay-models";
import { Multer } from "multer";

interface WhatsAppMap {
  [key: number | string]: AxiosInstance;
}

const whatsappInstance = whatsappMiddlewareInstance();
const whatsapp: WhatsAppMap = {
  687908507737544: axiosInstance("b2c"),
  757560927433872: axiosInstance("b2b")
};

//#region - listData
export const listMessages = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const from = req.query.from as string;
  const to = req.query.to as string;
  const search = req.query.s ? String(req.query.s).toLowerCase() : null;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const password: string | null = req.headers?.password as string || "";
  let isError = false;

  try {
    const query: any = {
      bool: {
        must: [
          { match: from ? { from } : { room_id: roomId } }
        ]
      }
    };

    if (search) {
      query.bool.must.push({
        match: {
          content: {
            query: search,
            fuzziness: "AUTO"
          }
        }
      });
    }

    const executeAll = await Promise.all([
      whatsappSchema.Messages.query()
        .select(
          "id",
          "ref_id as refId",
          "room_id as roomId",
          "phone_id as phoneId",
          "from",
          "to",
          "header",
          "body",
          "footer",
          "type",
          "status",
          "is_read as isRead",
          "line",
          "deleted_at as deletedAt",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .where("room_id", roomId)
        .orderBy("created_at", "DESC")
        .page(page - 1, limit),
      whatsappSchema.Chats.query()
        .select("id", "password", "name", "avatar")
        .findOne("id", roomId)
    ]);

    const dataChat = executeAll[1] as whatsappSchema.Chats;

    if (dataChat.password && password) {
      if (dataChat.password !== crypto.createHash("md5").update(password).digest("hex")) {
        isError = true;
      }
    } else if (dataChat.password && !password) {
      isError = true;
    }

    if (!isError) {
      if (page === 1) {
        const updateChat = whatsappSchema.Chats.query().patch({
          total_unread_message: 0,
          is_read: true,
        }).where("id", roomId);

        const updateBulkMessage = whatsappSchema.Messages.query().patch({
          is_read: true
        }).where("room_id", roomId);

        await Promise.all([
          updateChat,
          updateBulkMessage
        ]);
      }

      const { total, results } = executeAll[0];

      return res.status(200).json(successResponse("SUCCESS", {
        results: {
          pagination: paginationResponse(page, limit, Number(total) as number),
          data: convertKeysToCamel(results)
        }
      }));
    } else {
      return res.status(401).json(errorResponse(
        dataChat.password && password ? "Password is not match" : "Password is Required", {}
      ));
    }
  } catch (error: any) {
    console.log("ERROR ===>", error);
    return res.status(500).json(errorResponse(error.message || "Internal Server Error", {}));
  }
};
//#endregion - listData

//#region - sendMessage
export const sendMessage = async (req: Request, res: Response) => {
  const phoneId: string = req.params.phoneId;
  const password: string | null = req.headers?.password as string || "";
  const { to, message }: { to: string; message: string; } = req.body;
  let isError = false;

  const files = (req.files as Express.Multer.File[]) ?? [];

  const images = files.filter((f) => f.mimetype.startsWith("image/"));
  const audios = files.filter((f) => f.mimetype.startsWith("audio/"));
  const documents = files.filter((f) =>
    f.mimetype.startsWith("application/") || f.mimetype === "text/plain"
  );

  if (audios.length > 1) {
    return res.status(400).json(errorResponse("Only one audio file allowed", {}));
  }

  // Restu's note
  // Someone please clean this endpoint code
  try {
    const findChat = await whatsappSchema.Chats.query()
      .select("id", "password", "name", "avatar")
      .findOne({
        "phone_id": phoneId,
        "phone": to
      }) as whatsappSchema.Chats;

    if (findChat) {
      if (findChat.password && password) {
        if (findChat.password !== crypto.createHash("md5").update(password).digest("hex")) {
          isError = true;
        }
      } else if (findChat.password && !password) {
        isError = true;
      }
    }

    if (!isError) {
      if (files.length === 0) {
        const sendMessage = await whatsappInstance.post(`message/sendText/${phoneId}`, {
          to: to,
          message: message
        });

        return res.status(200).json(successResponse("SUCCESS", {
          errors: null,
          results: {
            ...sendMessage.data.results,
            file: {
              url: "",
              filename: "",
            }
          },
        }));
      } else {
        const uploadedFiles: any = {
          image: null,
          audio: null,
          document: null
        };

        if (images[0]) {
          uploadedFiles.image = await uploadToS3(images[0]);
        }

        if (audios[0]) {
          uploadedFiles.audio = await uploadToS3(audios[0]);
        }

        if (documents[0]) {
          uploadedFiles.document = await uploadToS3(documents[0]);
        }

        if (images.length > 0) {
          const sendMessage = await whatsappInstance.post(`message/sendImage/${phoneId}`, {
            to: to,
            message: message,
            url: uploadedFiles.image.url
          });

          return res.status(200).json(successResponse("SUCCESS", {
            errors: null,
            results: {
              ...sendMessage.data.results,
              file: uploadedFiles?.image || ""
            },
          }));
        } else if (documents.length > 0) {
          const sendMessage = await whatsappInstance.post(`message/sendDocument/${phoneId}`, {
            to: to,
            message: message,
            file: uploadedFiles.document
          });

          return res.status(200).json(successResponse("SUCCESS", {
            errors: null,
            results: {
              ...sendMessage.data.results,
              file: uploadedFiles.document
            },
          }));
        } else {
          return res.status(401).json(errorResponse("Your file is not supported", {}));
        }
      }
    } else {
      return res.status(401).json(errorResponse(
        findChat.password && password ? "Password is not match" : "Password is Required", {}
      ));
    }
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message || "Internal Server Error", {}));
  }
};
//#endregion - sendMessage

//#region - Take Chat
export const takeChat = async (req: Request, res: Response) => {
  const id = req.params.id;
  const defaultPassword = "12345678";

  try {
    const updateChat = await whatsappSchema.Chats.query().patch({
      password: crypto.createHash("md5").update(defaultPassword).digest("hex"),
    }).where("id", id);

    if (!updateChat) {
      return res.status(404).json(errorResponse("Chat not found", {}));
    }

    return res.status(200).json(successResponse("SUCCESS", {
      results: {}
    }));
  } catch (error: any) {
    return res.status(500).json(errorResponse(error.message || "Internal Server Error", {}));
  }
};
//#endregion - Take Chat
