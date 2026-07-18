import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { UserDocument } from "../models/user.model";
import {
  clearRefreshCookie,
  issueAuthTokens,
  toPublicUser,
} from "../utils/auth.tokens";
import {
  createEmailVerificationOtp,
  hashEmailToken,
  sendVerificationEmail,
} from "../utils/email.utils";
import {
  changePasswordSchema,
  loginSchema,
  resendVerificationSchema,
  signupSchema,
  updateProfileSchema,
  verifyEmailSchema,
  verifyOtpSchema,
} from "../validation/auth.validation";
import {
  STUDENT_COLLEGES,
  STUDENT_YEARS,
} from "../constants/auth.constants";
import { isEmailVerified } from "../utils/emailVerified";

const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid signup data.",
      });
    }

    const { name, email, password, college, year, mobileNumber } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) {
      // Same email may be a legacy admin account — not a student signup.
      if (existing.role !== "student") {
        return res.status(409).json({
          isErr: true,
          status: "error",
          message:
            "This email is already registered. Use a different email for student signup.",
        });
      }
      if (!isEmailVerified(existing)) {
        return res.status(409).json({
          isErr: true,
          status: "error",
          code: "EMAIL_NOT_VERIFIED",
          message:
            "Account exists but email is not verified. Resend the verification email.",
        });
      }
      return res.status(409).json({
        isErr: true,
        status: "error",
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { otp, hash, expires } = createEmailVerificationOtp();

    const user = await User.create({
      name,
      email,
      passwordHash,
      providers: ["local"],
      role: "student",
      college,
      year,
      mobileNumber,
      emailVerified: false,
      emailVerificationToken: hash,
      emailVerificationExpires: expires,
    });

    try {
      console.log(`[auth] signup OTP for ${email}: ${otp}`);
      await sendVerificationEmail({ to: email, name, otp });
    } catch (mailErr) {
      console.error("Verification email failed:", mailErr);
      await User.deleteOne({ _id: user._id });
      return res.status(502).json({
        isErr: true,
        status: "error",
        message:
          "Could not send verification email. Check RESEND_API_KEY / from address, then try again.",
      });
    }

    return res.status(201).json({
      isErr: false,
      status: "success",
      body: {
        needsVerification: true,
        email,
        message: "Check your inbox to verify your email before logging in.",
        ...(process.env.DEV_EXPOSE_OTP === "true" ? { otp } : {}),
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not create account.",
    });
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid login data.",
      });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email, role: "student" });
    if (!user?.passwordHash || !user.providers?.includes("local")) {
      return res.status(401).json({
        isErr: true,
        status: "error",
        message: "Invalid email or password.",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        isErr: true,
        status: "error",
        message: "Invalid email or password.",
      });
    }

    if (!isEmailVerified(user)) {
      return res.status(403).json({
        isErr: true,
        status: "error",
        code: "EMAIL_NOT_VERIFIED",
        message:
          "Please verify your email before logging in. Check your inbox or resend the link.",
        body: { email: user.email },
      });
    }

    const tokens = issueAuthTokens(user, res);
    return res.json({
      isErr: false,
      status: "success",
      body: tokens,
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not log in.",
    });
  }
};

const markEmailVerified = async (user: UserDocument, res?: Response) => {
  // Issue tokens first so a JWT misconfig doesn't leave a half-updated user.
  user.emailVerified = true;
  const tokens = issueAuthTokens(user, res);
  await User.updateOne(
    { _id: user._id },
    {
      $set: { emailVerified: true },
      $unset: {
        emailVerificationToken: 1,
        emailVerificationExpires: 1,
      },
    },
  );
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  return tokens;
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = verifyEmailSchema.safeParse({
      token: req.body?.token || req.query?.token,
    });
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid token.",
      });
    }

    const hash = hashEmailToken(parsed.data.token);
    const user = await User.findOne({
      role: "student",
      emailVerificationToken: hash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: "Verification link is invalid or has expired.",
      });
    }

    const tokens = await markEmailVerified(user, res);
    return res.json({
      isErr: false,
      status: "success",
      message: "Email verified.",
      body: tokens,
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not verify email.",
    });
  }
};

const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid OTP.",
      });
    }

    const { email, otp } = parsed.data;
    const hash = hashEmailToken(otp);
    const user = await User.findOne({
      email,
      role: "student",
      emailVerificationToken: hash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: "Invalid or expired OTP. Request a new code.",
      });
    }

    const tokens = await markEmailVerified(user, res);
    return res.json({
      isErr: false,
      status: "success",
      message: "Email verified.",
      body: tokens,
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not verify OTP.",
    });
  }
};

const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid email.",
      });
    }

    const { email } = parsed.data;
    const user = await User.findOne({ email, role: "student" });

    // Same response either way (avoid email enumeration)
    const okPayload = {
      isErr: false,
      status: "success",
      message:
        "If an unverified account exists for this email, a new code has been sent.",
    };

    if (!user || isEmailVerified(user)) {
      return res.json(okPayload);
    }

    const { otp, hash, expires } = createEmailVerificationOtp();
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerificationToken: hash,
          emailVerificationExpires: expires,
        },
      },
    );

    try {
      console.log(`[auth] resend OTP for ${email}: ${otp}`);
      await sendVerificationEmail({
        to: email,
        name: user.name || "there",
        otp,
      });
    } catch (mailErr) {
      console.error("Resend verification failed:", mailErr);
      return res.status(502).json({
        isErr: true,
        status: "error",
        message: "Could not send verification email. Try again shortly.",
      });
    }

    return res.json({
      ...okPayload,
      ...(process.env.DEV_EXPOSE_OTP === "true" ? { body: { otp } } : {}),
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not resend verification email.",
    });
  }
};

const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      isErr: true,
      status: "error",
      message: "Authentication required.",
    });
  }
  return res.json({
    isErr: false,
    status: "success",
    body: { user: req.user },
  });
};

const logout = async (_req: Request, res: Response) => {
  clearRefreshCookie(res);
  return res.json({
    isErr: false,
    status: "success",
    message: "Logged out.",
  });
};

/** Google OAuth — wire passport-google-oauth20 later; reuse issueAuthTokens. */
const googleStart = async (_req: Request, res: Response) => {
  return res.status(501).json({
    isErr: true,
    status: "error",
    message:
      "Google sign-in is not configured yet. Use email/password for now.",
  });
};

const googleCallback = async (_req: Request, res: Response) => {
  return res.status(501).json({
    isErr: true,
    status: "error",
    message:
      "Google OAuth callback is not configured yet. After Google auth, upsert User by googleId/email (college/year/mobile may be collected post-signup) and call issueAuthTokens.",
  });
};

const meta = async (_req: Request, res: Response) => {
  return res.json({
    isErr: false,
    status: "success",
    body: {
      colleges: STUDENT_COLLEGES,
      years: STUDENT_YEARS,
    },
  });
};

const updateProfile = async (
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

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid profile data.",
      });
    }

    const user = await User.findOne({ _id: req.user.id, role: "student" });
    if (!user) {
      return res.status(404).json({
        isErr: true,
        status: "error",
        message: "User not found.",
      });
    }

    const { name, college, year, mobileNumber } = parsed.data;
    await User.updateOne(
      { _id: user._id },
      { $set: { name, college, year, mobileNumber } },
    );
    const updated = await User.findById(user._id);
    if (!updated) {
      return res.status(404).json({
        isErr: true,
        status: "error",
        message: "User not found.",
      });
    }

    return res.json({
      isErr: false,
      status: "success",
      message: "Profile updated.",
      body: { user: toPublicUser(updated) },
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not update profile.",
    });
  }
};

const changePassword = async (
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

    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid password data.",
      });
    }

    const user = await User.findOne({ _id: req.user.id, role: "student" });
    if (!user?.passwordHash || !user.providers?.includes("local")) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: "Password change is not available for this account.",
      });
    }

    const { currentPassword, newPassword } = parsed.data;
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        isErr: true,
        status: "error",
        message: "Current password is incorrect.",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({
      isErr: false,
      status: "success",
      message: "Password updated.",
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not change password.",
    });
  }
};

export {
  signup,
  login,
  me,
  logout,
  googleStart,
  googleCallback,
  meta,
  verifyEmail,
  verifyOtp,
  resendVerification,
  updateProfile,
  changePassword,
};
