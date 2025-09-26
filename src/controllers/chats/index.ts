import { Request, Response } from "express";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { generateId } from "@utils/helpers";
import { whatsapp } from "@jumpapay/jumpapay-models";
import { raw } from "objection";

const chatColumns = [
  "chats.id",
  "chats.phone",
  "chats.name",
  "chats.avatar",
  raw("COALESCE(users.alias, users.name)").as("takenBy"),
  raw("CASE WHEN chats.password IS NOT NULL THEN true ELSE false END").as("isPasswordProtected"),
  "chats.last_message_at as lastMessageAt",
  "chats.last_message as lastMessage",
  "chats.is_read as isRead",
  "chats.is_session_active as isSessionActive",
  "chats.total_unread_message as totalUnreadMessage",
  "chats.last_seen as lastSeen",
  "chats.created_at as createdAt",
];

//#region - listUntakenChats
export const listUntakenChats = async (req: Request, res: Response) => {
  const phoneId = req.params.phoneId;
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const isRead: boolean | null = req.query.isRead ? !!Number(req.query.isRead) : null;
  const isSessionActive: boolean | null = req.query.isSessionActive ? !!Number(req.query.isSessionActive) : null;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = whatsapp.Chats.query()
      .select(chatColumns)
      .leftJoin("user.users", "users.id", "chats.taken_by")
      .orderBy("chats.last_message_at", "DESC")
      .where("chats.phone_id", phoneId)
      .whereNull("chats.taken_by")
      .page(page - 1, limit);

    if (isRead !== null) {
      rawQuery.where("chats.is_read", isRead);
    }

    if (isSessionActive !== null) {
      rawQuery.where("chats.is_session_active", isSessionActive);
    }

    if (searchKeywords) {
      const keyword = `%${searchKeywords}%`;
      rawQuery.where(function () {
        this.whereRaw("LOWER(chats.phone) LIKE ?", [keyword])
          .orWhereRaw("LOWER(chats.name) LIKE ?", [keyword])
      });
    }

    const { total, results } = await rawQuery;

    let totalData = total;
    res.status(200).json(
      successResponse("SUCCESS", {
        results: {
          pagination: paginationResponse(page, limit, totalData),
          data: results
        }
      })
    );
  } catch (error: unknown) {
    console.log("ERROR ===>", error);
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error?.message, { results: null })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", { results: null })
      );
    }
  }
};
//#endregion - listUntakenChats

//#region - listTakenChats
export const listTakenChats = async (req: Request, res: Response) => {
  const phoneId = req.params.phoneId;
  const limit: number = Number(req.query.limit) || 10;
  const page: number = Number(req.query.page) || 1;
  const isRead: boolean | null = req.query.isRead ? !!Number(req.query.isRead) : null;
  const isSessionActive: boolean | null = req.query.isSessionActive ? !!Number(req.query.isSessionActive) : null;
  const searchKeywords: string | null = req.query?.s ? String(req.query.s)?.toLowerCase() : null;

  try {
    const rawQuery = whatsapp.Chats.query()
      .select(chatColumns)
      .leftJoin("user.users", "users.id", "chats.taken_by")
      .orderBy("chats.last_message_at", "DESC")
      .where("chats.phone_id", phoneId)
      .whereNotNull("chats.taken_by")
      .page(page - 1, limit);

    if (isRead !== null) {
      rawQuery.where("chats.is_read", isRead);
    }

    if (isSessionActive !== null) {
      rawQuery.where("chats.is_session_active", isSessionActive);
    }

    if (searchKeywords) {
      const keyword = `%${searchKeywords}%`;
      rawQuery.where(function () {
        this.whereRaw("LOWER(chats.phone) LIKE ?", [keyword])
          .orWhereRaw("LOWER(chats.name) LIKE ?", [keyword])
      });
    }

    const { total, results } = await rawQuery;

    let totalData = total;
    res.status(200).json(
      successResponse("SUCCESS", {
        results: {
          pagination: paginationResponse(page, limit, totalData),
          data: results
        }
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json(
        errorResponse(error?.message, { results: null })
      );
    } else {
      res.status(500).json(
        errorResponse("Internal server error", { results: null })
      );
    }
  }
};
//#endregion - listTakenChats