import mongoose, { Model, Document, Schema } from "mongoose";

type ModulePurchaseType = {
  userId: string;
  name: string;
  address?: string;
  contactNumber: string;
  productId: string;
  email: string;
  orderId: string;
  paymentId: string;
  signature: string;
  purchaseType: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type ModulePurchaseDocument = Document & ModulePurchaseType;

type ModulePurchaseInput = {
  userId: ModulePurchaseDocument["userId"];
  name: ModulePurchaseDocument["name"];
  address?: ModulePurchaseDocument["address"];
  contactNumber: ModulePurchaseDocument["contactNumber"];
  productId: ModulePurchaseDocument["productId"];
  email: ModulePurchaseDocument["email"];
  orderId: ModulePurchaseDocument["orderId"];
  paymentId: ModulePurchaseDocument["paymentId"];
  signature: ModulePurchaseDocument["signature"];
  purchaseType: ModulePurchaseDocument["purchaseType"];
};

const ModulePurchaseSchema = new Schema(
  {
    userId: { type: Schema.Types.String, required: true, index: true },
    name: { type: Schema.Types.String, required: true },
    address: { type: Schema.Types.String, required: false },
    contactNumber: { type: Schema.Types.String, required: true },
    productId: { type: Schema.Types.String, required: true, index: true },
    email: { type: Schema.Types.String, required: true },
    orderId: { type: Schema.Types.String, required: true },
    paymentId: { type: Schema.Types.String, required: true },
    signature: { type: Schema.Types.String, required: true },
    purchaseType: { type: Schema.Types.String, required: true },
  },
  { timestamps: true },
);

const ModulePurchase: Model<ModulePurchaseDocument> =
  mongoose.model<ModulePurchaseDocument>(
    "modulesPurchase",
    ModulePurchaseSchema,
  );

export default ModulePurchase;
export { ModulePurchaseInput, ModulePurchaseType, ModulePurchaseDocument };
