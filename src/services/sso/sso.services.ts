// import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";
import {
  GenerateTokenResponse
} from "@root/src/dataTypes";
import ssoInstance from "@config/sso";
import dotenv from "dotenv";
dotenv.config();
const clientId: string | undefined = process.env.SSO_CLIENT_ID;

const sso = ssoInstance();

export class SsoService {
  async generateToken(code: string): Promise<GenerateTokenResponse> {
    const formData = {
      code,
      clientId: clientId
    };
    const execution = await sso.post<GenerateTokenResponse>("/auth/generate-token", formData);
    return execution.data;
  }
}

export default new SsoService();
