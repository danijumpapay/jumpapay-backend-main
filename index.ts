import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import routesV1 from "./src/routes/v1/index";
import { initializeModels } from "@jumpapay/jumpapay-models";
import knex from "@config/connection"; 
import { types } from "pg";
import { errorHandler, errorResponse } from "@utils/response";
const TIMESTAMPTZ_OID = 1184;
const TIMESTAMP_OID = 1114;

dotenv.config();

types.setTypeParser(TIMESTAMPTZ_OID, (val) => val);
types.setTypeParser(TIMESTAMP_OID, (val) => val); 

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
initializeModels(knex);

app.use("/api/v1", routesV1);

app.use((req: Request, res: Response, next: NextFunction) => {
  errorResponse(res, 404, `Not Found - ${req.originalUrl}`);
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`\x1b[94mServer started on\x1b[0m \x1b[92mhttp://localhost:${port}\x1b[0m`);
});
