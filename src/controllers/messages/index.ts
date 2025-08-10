import { Request, Response } from "express";
import { paginationResponse, successResponse, errorResponse } from "@utils/response";
import { generateId } from "@utils/helpers";
import { esClient } from "@config/elastic";

//#region - listData
export const listMessages = async (req: Request, res: Response) => {
  const from = req.query.from as string;
  const to = req.query.to as string;
  const search = req.query.s ? String(req.query.s).toLowerCase() : null;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const fromIndex = (page - 1) * limit;

  if (!from || !to) {
    return res.status(400).json(errorResponse("Query 'from' and 'to' is required", {}));
  }

  try {
    const query: any = {
      bool: {
        must: [
          { match: { from } },
          { match: { to } }
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

    const response = await esClient.search({
      index: "messages",
      from: fromIndex,
      size: limit,
      query: query,
    });

    const hits = response.hits.hits.map(hit => hit._source);
    const total = response.hits.total as { value: number };

    return res.status(200).json(successResponse("SUCCESS", {
      results: {
        pagination: paginationResponse(page, limit, total.value),
        data: hits
      }
    }));
  } catch (error: any) {
    console.error("Elasticsearch Error:", error);
    return res.status(500).json(errorResponse(error.message || "Internal Server Error", {}));
  }
};
//#endregion - listData

//#region - sendMessage
export const sendMessage = async (req: Request, res: Response) => {
  const from = req.query.from as string;
  const to = req.query.to as string;
  const search = req.query.s ? String(req.query.s).toLowerCase() : null;
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const fromIndex = (page - 1) * limit;

  if (!from || !to) {
    return res.status(400).json(errorResponse("Query 'from' and 'to' is required", {}));
  }

  try {
    const query: any = {
      bool: {
        must: [
          { match: { from } },
          { match: { to } }
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

    const response = await esClient.search({
      index: "messages",
      from: fromIndex,
      size: limit,
      query: query,
    });

    const hits = response.hits.hits.map(hit => hit._source);
    const total = response.hits.total as { value: number };

    return res.status(200).json(successResponse("SUCCESS", {
      results: {
        pagination: paginationResponse(page, limit, total.value),
        data: hits
      }
    }));
  } catch (error: any) {
    console.error("Elasticsearch Error:", error);
    return res.status(500).json(errorResponse(error.message || "Internal Server Error", {}));
  }
};
//#endregion - sendMessage