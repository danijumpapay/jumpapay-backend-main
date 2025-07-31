import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authSecret from "@config/auth";
import { generateId } from "@utils/helpers";
import { authResponse, successResponse, errorResponse } from "@utils/response";
import Users from "@models/user/Users.model";

export const login = async (req: Request, res: Response) => {
  const { user, password } = req.body;

  try {
    const dataUser = await Users.query()
      .select()
      .where((q) =>
        q.where("user.users.username", user)
          .orWhere("user.users.phone", user)
      )
      .first();

    if (dataUser) {
      const comparePassword = bcrypt.compareSync(password, dataUser.password || "");

      if (!comparePassword) {
        return res.status(401).json(authResponse(false, "Invalid Password!"));
      }

      if (!dataUser.is_active) {
        return res.status(401).json(authResponse(false, "Sorry User Deactivate!"));
      }

      const token = jwt.sign(
        {
          id: dataUser.id,
          role: dataUser.role,
          username: dataUser.username,
          name: dataUser.name,
          isVerified: !!dataUser.verified_at,
        },
        authSecret,
        {
          expiresIn: 1 * 12 * 60 * 60, 
        }
      );

      const userData = {
        id: dataUser.id,
        name: dataUser.name,
        username: dataUser.username,
        phone: dataUser.phone,
        role: dataUser.role,
        avatar: dataUser.avatar,
      };

      res.status(200).json(authResponse(true, "Success!", token, userData));
    } else {
      res.status(404).json(authResponse(false, "User Not Found!"));
    }
  } catch (error) {
    res.status(500).json(authResponse(false, `ERROR! ===> ${error}`));
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, password: formPassword, phone, role } = req.body;

  try {
    const id: string = generateId(name);
    const hashedPassword: string = await bcrypt.hash(formPassword, 13);

    const formData = {
      id,
      name,
      phone,
      password: hashedPassword,
      is_active: true,
      verified_at: null,
      role: role || "CUSTOMER", 
    };

    const isUserExist = await Users.querySoftDelete().findOne({ "user.users.phone": phone });

    if (isUserExist) {
      return res.status(409).json(
        errorResponse("Phone already exists", { results: null })
      );
    }

    const user = await Users.query().insert(formData);
    const { password, verified_at, is_active, is_reviewer, ...rest } = user;
    const updatedUser = {
      ...rest,
      isVerified: !!verified_at,
      isActive: is_active,
      isReviewer: is_reviewer,
    };

    res.status(201).json(successResponse("Success", { results: updatedUser }));
  } catch (error) {
    res.status(504).json(
      errorResponse("Internal server error", { results: null })
    );
  }
};
