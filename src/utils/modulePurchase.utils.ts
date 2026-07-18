import ModulePurchase, {
  ModulePurchaseInput,
} from "../models/modulePurchase.model";

const ACCESS_MONTHS = 6;

const addModulePurchase = async (purchase: ModulePurchaseInput) => {
  await ModulePurchase.create(purchase);
};

const getPurchasesByUserId = async (userId: string) => {
  return ModulePurchase.find({ userId }).sort({ createdAt: -1 }).lean();
};

const getLatestPurchaseForUserProduct = async (
  userId: string,
  productId: string,
) => {
  return ModulePurchase.findOne({ userId, productId })
    .sort({ createdAt: -1 })
    .lean();
};

const isPurchaseActive = (purchase: { createdAt?: Date | string }) => {
  if (!purchase?.createdAt) return true;
  const created = new Date(purchase.createdAt).getTime();
  const expires = created + ACCESS_MONTHS * 30 * 24 * 60 * 60 * 1000;
  return Date.now() <= expires;
};

export {
  addModulePurchase,
  getPurchasesByUserId,
  getLatestPurchaseForUserProduct,
  isPurchaseActive,
  ACCESS_MONTHS,
};
