import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import premiumRouter from "./routes/premium.router";
import subscriptionRouter from "./routes/subscription.router";
import modulesRouter from "./routes/modules.rotuer";
import paymentRouter from "./routes/payment.router";
import authRouter from "./routes/auth.router";
import accessRouter from "./routes/access.router";
import freeNotesRouter from "./routes/freeNotes.router";
import { connectDB } from "./config/mongodb.config";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "Notes-Era API",
    health: "/health",
    docs: {
      modules: "/api/modules",
      auth: "/api/auth/meta",
    },
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, status: "up" });
});

app.use("/api/auth", authRouter);
app.use("/api/access", accessRouter);
app.use("/api/free-notes", freeNotesRouter);
app.use("/api/premium", premiumRouter);
app.use("/api/subscribe", subscriptionRouter);
app.use("/api/modules", modulesRouter);
app.use("/api/payment", paymentRouter);

app.use(errorHandler);

// Railway needs the process listening on 0.0.0.0:$PORT immediately.
// Do not wait for Mongo before bind — that causes "Application failed to respond".
const server = app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err);
});

process.on("unhandledRejection", (error) => {
  console.error(`Unhandled rejection: ${error}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
