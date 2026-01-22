import { Request, Response } from "express";
import { errorResponseOld } from "@utils/response";
import ssoService from "@services/sso/sso.services";

export const exchange = async (req: Request, res: Response) => {
  const {
    code,
  } = req.body;

  try {
    const execution = await ssoService.generateToken(code);
    if (execution.success) {
      res.cookie("access_token", execution.results.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/api",
        maxAge: 1000 * 60 * 10
      });
      return res.status(200).json({
        success: true,
        results: {
          user: execution.results.user
        }
      });
    } else {
      return res.status(400).json(errorResponseOld(execution.message));
    }
  } catch (err) {
    console.log("ERROR GET ME : ", err);
    return res.status(500).json(errorResponseOld("INTERNAL ERROR"));
  }
};


export const check = async (req: Request, res: Response) => {
  try {
    if (!req.currentUser?.sub)
      return res.status(401).json(errorResponseOld("UNAUTHENTICATED"));

    return res.json({
      success: true,
      results: {
        user: {
          userId: req.currentUser.sub,
          role: req.currentUser.role,
        }
      }
    });
  } catch (err) {
    return res.status(401).json(errorResponseOld("TOKEN IS NOT VALID"));
  }
};
