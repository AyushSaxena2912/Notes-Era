import { NextFunction, Request, Response } from "express";
import { getFileId } from "../utils/modules.utils";
import {
  ACCESS_MONTHS,
  getLatestPurchaseForUserProduct,
  getPurchasesByUserId,
  isPurchaseActive,
} from "../utils/modulePurchase.utils";

const listMyModules = async (
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

    const purchases = await getPurchasesByUserId(req.user.id);
    const body = purchases.map((p) => {
      const createdAt = p.createdAt ? new Date(p.createdAt) : new Date();
      const expiresAt = new Date(
        createdAt.getTime() + ACCESS_MONTHS * 30 * 24 * 60 * 60 * 1000,
      );
      return {
        productId: p.productId,
        purchaseType: p.purchaseType,
        orderId: p.orderId,
        purchasedAt: createdAt,
        expiresAt,
        active: isPurchaseActive(p),
      };
    });

    return res.json({
      isErr: false,
      status: "success",
      body: { modules: body },
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not load purchases.",
    });
  }
};

const getModuleAccess = async (
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

    const slug = req.params.slug;
    const purchase = await getLatestPurchaseForUserProduct(req.user.id, slug);
    if (!purchase) {
      return res.status(403).json({
        isErr: true,
        status: "error",
        message: "You do not own this module.",
      });
    }

    if (!isPurchaseActive(purchase)) {
      return res.status(403).json({
        isErr: true,
        status: "error",
        message: "Your 6-month access for this module has expired.",
      });
    }

    const fileId = await getFileId(slug);
    if (!fileId) {
      return res.status(404).json({
        isErr: true,
        status: "error",
        message: "Module file not found.",
      });
    }

    const driveUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drive_link`;
    return res.json({
      isErr: false,
      status: "success",
      body: {
        productId: slug,
        driveUrl,
        purchaseType: purchase.purchaseType,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(500).json({
      isErr: true,
      status: "error",
      message: "Could not load module access.",
    });
  }
};

export { listMyModules, getModuleAccess };
