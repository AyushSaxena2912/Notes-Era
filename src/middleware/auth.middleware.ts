import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import { toPublicUser, verifyAccessToken } from "../utils/auth.tokens";
import { isEmailVerified } from "../utils/emailVerified";

const getBearerToken = (req: Request) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        isErr: true,
        status: "error",
        message: "Authentication required.",
      });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({
        isErr: true,
        status: "error",
        message: "Invalid or expired token.",
      });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({
        isErr: true,
        status: "error",
        message: "User not found.",
      });
    }

    req.user = toPublicUser(user);
    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Auth check failed.",
    });
  }
};

/** Use after requireAuth for buy / access / free-notes. */
export const requireVerifiedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        isErr: true,
        status: "error",
        message: "Authentication required.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || !isEmailVerified(user)) {
      return res.status(403).json({
        isErr: true,
        status: "error",
        code: "EMAIL_NOT_VERIFIED",
        message: "Verify your email before continuing.",
      });
    }

    req.user = toPublicUser(user);
    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Auth check failed.",
    });
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next();
    const payload = verifyAccessToken(token);
    if (!payload) return next();
    const user = await User.findById(payload.sub);
    if (user) req.user = toPublicUser(user);
    return next();
  } catch {
    return next();
  }
};
