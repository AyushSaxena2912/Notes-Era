import { z } from "zod";
import { STUDENT_YEARS } from "../constants/auth.constants";

const yearEnum = z.enum(STUDENT_YEARS);

const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/\d/, "Password must include a number");

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: passwordSchema,
  college: z
    .string()
    .trim()
    .min(2, "Enter your college / university name")
    .max(120)
    .refine((value) => value.toLowerCase() !== "other", {
      message: "Please type your college / university name",
    }),
  year: yearEnum,
  mobileNumber: mobileSchema,
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(20, "Invalid verification token"),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  college: z
    .string()
    .trim()
    .min(2, "Enter your college / university name")
    .max(120)
    .refine((value) => value.toLowerCase() !== "other", {
      message: "Please type your college / university name",
    }),
  year: yearEnum,
  mobileNumber: mobileSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

/** Module slugs in DB can include spaces, (), &, etc. */
const productIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9 _\-().&,]+$/, "Invalid product id");

export const createOrderSchema = z.object({
  productId: productIdSchema,
  type: z.enum(["soft", "hard"]),
});

export const createCartOrderSchema = z.object({
  productIds: z.array(productIdSchema).min(1).max(30),
  couponCode: z.string().trim().max(40).optional(),
});

export const verifyPaymentSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  address: z.string().trim().max(300).optional(),
  contactNumber: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).replace(/\D/g, ""))
    .pipe(mobileSchema)
    .optional(),
  token: z.string().min(1),
  orderId: z.string().min(1),
  /** Required for Razorpay; Cashfree verifies server-side from order status. */
  paymentId: z.string().min(1).optional(),
  signature: z.string().min(1).optional(),
  gateway: z.enum(["cashfree", "razorpay"]).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
