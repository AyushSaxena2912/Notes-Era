import { Request, Response, NextFunction } from "express";
import { createOrder as createRazorpayOrder } from "../utils/razorpay.utils";
import {
  createCashfreeOrder,
  verifyCashfreePayment,
} from "../utils/cashfree.utils";
import { getPaymentGateway } from "../config/payment.config";
import { getAmount, getFileId } from "../utils/modules.utils";
import { addPermission } from "../utils/drive.utils";
import { generateHMAC, generateJWT } from "../utils/utils";
import {
  addModulePurchase,
  getLatestPurchaseForUserProduct,
  isPurchaseActive,
} from "../utils/modulePurchase.utils";
import { verifyOrderToken, OrderTokenType } from "../utils/payment.utils";
import { getCouponDiscount } from "../utils/coupons.utils";
import {
  createCartOrderSchema,
  createOrderSchema,
  verifyPaymentSchema,
} from "../validation/auth.validation";

const PLATFORM_FEE_RUPEES = 2;

const getAlreadyOwnedProductIds = async (
  userId: string,
  productIds: string[],
) => {
  const owned: string[] = [];
  for (const productId of productIds) {
    const purchase = await getLatestPurchaseForUserProduct(userId, productId);
    if (purchase && isPurchaseActive(purchase)) {
      owned.push(productId);
    }
  }
  return owned;
};

const normalizePhone = (value?: string) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return "9999999999";
};

const resolveProductIds = (token: OrderTokenType) => {
  if (Array.isArray(token.productIds) && token.productIds.length) {
    return [...new Set(token.productIds)];
  }
  if (token.productId) return [token.productId];
  return [];
};

const createGatewayOrder = async ({
  req,
  amountRupees,
  orderIdSeed,
  type,
  productId,
  productIds,
  description,
}: {
  req: Request;
  amountRupees: number;
  orderIdSeed: string;
  type: "soft" | "hard";
  productId?: string;
  productIds?: string[];
  description: string;
}) => {
  const gateway = getPaymentGateway();
  const user = req.user!;

  if (gateway === "cashfree") {
    const orderId = `ne_${orderIdSeed}_${Date.now()}`.replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );
    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      amountRupees,
      customer: {
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: normalizePhone(user.mobileNumber),
      },
      orderNote: description,
    });

    const token = generateJWT({
      orderId: cashfreeOrder.orderId,
      type,
      productId,
      productIds,
      userId: user.id,
      gateway: "cashfree",
    });

    return {
      gateway: "cashfree" as const,
      order_id: cashfreeOrder.orderId,
      payment_session_id: cashfreeOrder.paymentSessionId,
      token,
      amount: cashfreeOrder.amount,
      currency: cashfreeOrder.currency,
      mode: cashfreeOrder.mode,
      name: "Notes-Era",
      description,
    };
  }

  const { id, amount, currency } = await createRazorpayOrder(
    Math.round(amountRupees * 100),
  );
  const token = generateJWT({
    orderId: id,
    type,
    productId,
    productIds,
    userId: user.id,
    gateway: "razorpay",
  });

  return {
    gateway: "razorpay" as const,
    order_id: id,
    token,
    amount,
    currency,
    key: process.env.RAZOR_ID,
    name: "Notes-Era",
    description,
  };
};

const createNewOrder = async (
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

    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid order data.",
      });
    }

    const { productId, type } = parsed.data;

    const alreadyOwned = await getAlreadyOwnedProductIds(req.user.id, [
      productId,
    ]);
    if (alreadyOwned.length) {
      return res.status(409).json({
        isErr: true,
        status: "error",
        message: "You already own this module.",
        ownedProductIds: alreadyOwned,
      });
    }

    const { softCopyPrice, hardCopyPrice } = await getAmount(productId);
    const amountRupees = type === "soft" ? softCopyPrice : hardCopyPrice;

    if (!amountRupees || amountRupees <= 0) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: "Price not available for this module.",
      });
    }

    const payload = await createGatewayOrder({
      req,
      amountRupees,
      orderIdSeed: productId,
      type,
      productId,
      description: `Order of ${productId} ${type}Copy.`,
    });

    return res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isErr: true,
      message:
        err instanceof Error
          ? err.message
          : "Internal error occured while creating order.",
      status: "error",
    });
    next(err);
  }
};

const createCartOrder = async (
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

    const parsed = createCartOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid cart data.",
      });
    }

    const productIds = [...new Set(parsed.data.productIds)];

    const alreadyOwned = await getAlreadyOwnedProductIds(
      req.user.id,
      productIds,
    );
    if (alreadyOwned.length) {
      return res.status(409).json({
        isErr: true,
        status: "error",
        message:
          alreadyOwned.length === 1
            ? "You already own this module. Remove it from your cart to continue."
            : "Some modules in your cart are already purchased. Remove them to continue.",
        ownedProductIds: alreadyOwned,
      });
    }

    let subtotal = 0;

    for (const productId of productIds) {
      const { softCopyPrice } = await getAmount(productId);
      if (!softCopyPrice || softCopyPrice <= 0) {
        return res.status(400).json({
          isErr: true,
          status: "error",
          message: `Price not available for module: ${productId}`,
        });
      }
      subtotal += softCopyPrice;
    }

    const discount = getCouponDiscount(parsed.data.couponCode, subtotal);
    const amountRupees = Math.max(
      1,
      subtotal - discount + PLATFORM_FEE_RUPEES,
    );

    const payload = await createGatewayOrder({
      req,
      amountRupees,
      orderIdSeed: `cart_${productIds.length}`,
      type: "soft",
      productIds,
      description: `Cart order (${productIds.length} modules)`,
    });

    return res.json({
      ...payload,
      productIds,
      subtotal,
      discount,
      platformFee: PLATFORM_FEE_RUPEES,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isErr: true,
      message:
        err instanceof Error
          ? err.message
          : "Internal error occured while creating cart order.",
      status: "error",
    });
    next(err);
  }
};

const fulfillPurchase = async ({
  req,
  decodedToken,
  orderId,
  paymentId,
  signature,
  name,
  address,
  contactNumber,
}: {
  req: Request;
  decodedToken: OrderTokenType;
  orderId: string;
  paymentId: string;
  signature: string;
  name?: string;
  address?: string;
  contactNumber?: string;
}) => {
  const buyerEmail = req.user!.email;
  const buyerName = name || req.user!.name || "Student";
  const buyerPhone = normalizePhone(
    contactNumber || req.user!.mobileNumber,
  );
  const productIds = resolveProductIds(decodedToken);

  if (!productIds.length) {
    return {
      ok: false as const,
      status: 400,
      message: "No products found on this order.",
    };
  }

  for (const productId of productIds) {
    const existing = await getLatestPurchaseForUserProduct(
      req.user!.id,
      productId,
    );
    if (existing && isPurchaseActive(existing)) {
      // Already owned (e.g. race / double verify) — still ensure Drive share.
      if (decodedToken.type === "soft") {
        const fileId = await getFileId(productId);
        if (fileId) {
          try {
            await addPermission(buyerEmail, fileId);
          } catch (err) {
            console.warn(
              `Drive share failed for owned ${productId} (${fileId}).`,
              err,
            );
          }
        }
      }
      continue;
    }

    if (decodedToken.type === "soft") {
      const fileId = await getFileId(productId);
      if (fileId) {
        try {
          await addPermission(buyerEmail, fileId);
        } catch (err) {
          // Paid order should still succeed; Drive share can be fixed later.
          console.warn(
            `Drive share failed for ${productId} (${fileId}). Purchase will still be saved.`,
            err,
          );
        }
      } else {
        console.warn(
          `No Drive fileId for ${productId} — purchase will still be saved.`,
        );
      }
    } else {
      console.log(`${buyerName} bought ${productId} hard copy.`);
    }

    await addModulePurchase({
      userId: req.user!.id,
      name: buyerName,
      address,
      contactNumber: buyerPhone,
      productId,
      email: buyerEmail,
      orderId,
      paymentId,
      signature,
      purchaseType: decodedToken.type,
    });
  }

  return { ok: true as const };
};

const verifyPayment = async (
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

    const parsed = verifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: parsed.error.issues[0]?.message || "Invalid payment data.",
      });
    }

    const {
      name,
      address,
      contactNumber,
      token,
      orderId,
      paymentId,
      signature,
      gateway: bodyGateway,
    } = parsed.data;

    const decodedToken = verifyOrderToken(token);
    if (
      !decodedToken ||
      decodedToken.orderId !== orderId ||
      decodedToken.userId !== req.user.id
    ) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: "Order details are not correct.",
      });
    }

    const gateway =
      bodyGateway || decodedToken.gateway || getPaymentGateway();

    if (gateway === "cashfree") {
      const paid = await verifyCashfreePayment(orderId);
      if (!paid) {
        return res.status(400).json({
          isErr: true,
          status: "error",
          message: "Payment not completed on Cashfree yet.",
        });
      }

      const result = await fulfillPurchase({
        req,
        decodedToken,
        orderId: paid.orderId,
        paymentId: paid.paymentId,
        signature: `cashfree:${paid.orderStatus}`,
        name,
        address,
        contactNumber,
      });

      if (!result.ok) {
        return res.status(result.status).json({
          isErr: true,
          status: "error",
          message: result.message,
        });
      }

      return res.json({ isErr: false, status: "success", gateway: "cashfree" });
    }

    if (!paymentId || !signature) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: "Payment id and signature are required for Razorpay.",
      });
    }

    const orderSignature = generateHMAC(
      orderId + "|" + paymentId,
      process.env.RAZOR_SECRET,
    );

    if (signature !== orderSignature) {
      return res.status(400).json({
        isErr: true,
        status: "error",
        message: "Order details are not correct.",
      });
    }

    const result = await fulfillPurchase({
      req,
      decodedToken,
      orderId,
      paymentId,
      signature,
      name,
      address,
      contactNumber,
    });

    if (!result.ok) {
      return res.status(result.status).json({
        isErr: true,
        status: "error",
        message: result.message,
      });
    }

    return res.json({ isErr: false, status: "success", gateway: "razorpay" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isErr: true,
      message: "Internal error occured while verifying order.",
      status: "error",
    });
    next(err);
  }
};

export { createNewOrder, createCartOrder, verifyPayment };
