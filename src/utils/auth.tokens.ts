import jwt from "jsonwebtoken";
import { Response } from "express";
import { UserDocument } from "../models/user.model";
import { AuthUser } from "../types/express";
import {
  ACCESS_TOKEN_TTL,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL,
} from "../constants/auth.constants";
import { isEmailVerified } from "./emailVerified";

type AccessPayload = {
  sub: string;
  email: string;
  role: "student";
  type: "access";
};

type RefreshPayload = {
  sub: string;
  type: "refresh";
};

const accessSecret = () =>
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "dev-access-secret";
const refreshSecret = () =>
  process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "dev-refresh-secret";

export const toPublicUser = (user: UserDocument): AuthUser => ({
  id: String(user._id),
  email: user.email,
  name: user.name || "",
  role: "student",
  college: user.college || "",
  year: user.year || "",
  mobileNumber: user.mobileNumber || "",
  providers: (user.providers || ["local"]) as AuthUser["providers"],
  emailVerified: isEmailVerified(user),
});

export const issueAuthTokens = (user: UserDocument, res?: Response) => {
  const publicUser = toPublicUser(user);

  const accessToken = jwt.sign(
    {
      sub: publicUser.id,
      email: publicUser.email,
      role: publicUser.role,
      type: "access",
    } satisfies AccessPayload,
    accessSecret(),
    { expiresIn: ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"] },
  );

  const refreshToken = jwt.sign(
    {
      sub: publicUser.id,
      type: "refresh",
    } satisfies RefreshPayload,
    refreshSecret(),
    { expiresIn: REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"] },
  );

  if (res) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  return { accessToken, refreshToken, user: publicUser };
};

export const verifyAccessToken = (token: string): AccessPayload | null => {
  try {
    const decoded = jwt.verify(token, accessSecret()) as AccessPayload;
    if (decoded?.type !== "access" || !decoded.sub) return null;
    return decoded;
  } catch {
    return null;
  }
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};
