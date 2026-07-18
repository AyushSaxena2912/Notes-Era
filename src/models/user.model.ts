import mongoose, { Document, Model, Schema } from "mongoose";

type AuthProvider = "local" | "google";

type UserType = {
  email: string;
  name?: string;
  passwordHash?: string;
  providers: AuthProvider[];
  googleId?: string;
  role: "student" | "admin";
  college?: string;
  year?: string;
  mobileNumber?: string;
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
};

type UserDocument = Document & UserType;

const UserSchema = new Schema(
  {
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: Schema.Types.String, required: false, trim: true },
    passwordHash: { type: Schema.Types.String, required: false },
    providers: {
      type: [Schema.Types.String],
      enum: ["local", "google"],
      default: ["local"],
    },
    googleId: {
      type: Schema.Types.String,
      required: false,
      sparse: true,
      unique: true,
    },
    role: {
      type: Schema.Types.String,
      enum: ["student", "admin"],
      default: "student",
    },
    // Required for students at signup (zod); optional so legacy admin docs don't break.
    college: { type: Schema.Types.String, required: false, trim: true },
    year: { type: Schema.Types.String, required: false, trim: true },
    mobileNumber: { type: Schema.Types.String, required: false, trim: true },
    emailVerified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: Schema.Types.String,
      required: false,
      default: null,
    },
    emailVerificationExpires: {
      type: Schema.Types.Date,
      required: false,
      default: null,
    },
  },
  { timestamps: true },
);

const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  UserSchema,
);

export default User;
export { UserDocument, UserType, AuthProvider };
