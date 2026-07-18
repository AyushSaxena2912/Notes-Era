import dotenv from "dotenv";
dotenv.config();
import { google } from "googleapis";

const scopes = ["https://www.googleapis.com/auth/drive"];

let client: InstanceType<typeof google.auth.JWT> | null = null;

const isDriveConfigured = () =>
  Boolean(process.env.DRIVE_EMAIL?.trim() && process.env.DRIVE_KEY?.trim());

const getAuthClient = () => {
  if (client) return client;
  if (!isDriveConfigured()) {
    throw new Error("DRIVE_EMAIL / DRIVE_KEY missing in .env");
  }
  const email = Buffer.from(process.env.DRIVE_EMAIL!, "base64").toString(
    "utf8",
  );
  const key = Buffer.from(process.env.DRIVE_KEY!, "base64")
    .toString("utf8")
    .replace(/\\n/g, "\n");
  client = new google.auth.JWT({
    email,
    key,
    scopes,
  });
  return client;
};

const getDrive = () => google.drive({ version: "v3", auth: getAuthClient() });

export { getDrive, isDriveConfigured };
