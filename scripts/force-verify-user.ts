import "dotenv/config";
import { createHash } from "crypto";
import mongoose from "mongoose";
import User from "../src/models/user.model";
import { issueAuthTokens } from "../src/utils/auth.tokens";

const email = process.argv[2] || "ayushsaxena2912@gmail.com";
const otp = process.argv[3] || "191203";

const hashOtp = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const user = await User.findOne({ email, role: "student" });
  if (!user) {
    console.log(JSON.stringify({ ok: false, message: "Student user not found" }));
    process.exit(1);
  }

  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    },
  );

  const tokens = issueAuthTokens(user);
  console.log(
    JSON.stringify({
      ok: true,
      otpUsed: otp,
      hash: hashOtp(otp).slice(0, 8),
      accessToken: tokens.accessToken,
      user: tokens.user,
    }),
  );
  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
