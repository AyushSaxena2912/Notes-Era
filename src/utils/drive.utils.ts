import { getDrive, isDriveConfigured } from "../config/drive.config";

/**
 * DB sometimes stores full Drive URLs instead of bare file ids.
 * Extract a usable file id for the Drive API.
 */
const normalizeDriveFileId = (raw?: string | null): string | null => {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;

  if (
    !value.includes("http") &&
    !value.includes("/") &&
    /^[a-zA-Z0-9_-]{10,}$/.test(value)
  ) {
    return value;
  }

  const match =
    value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    value.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    value.match(/\/open\?id=([a-zA-Z0-9_-]+)/);

  return match?.[1] || null;
};

const addPermission = async (userEmail: string, fileIdRaw: string) => {
  const fileId = normalizeDriveFileId(fileIdRaw);
  if (!fileId) {
    console.warn(`Invalid Drive file id — skipped share for ${fileIdRaw}`);
    return { skipped: true as const };
  }

  if (!isDriveConfigured()) {
    console.warn(
      `Drive not configured — skipped sharing ${fileId} with ${userEmail}.`,
    );
    return { skipped: true as const };
  }

  try {
    const drive = getDrive();
    const res = await drive.permissions.create({
      fileId,
      requestBody: { type: "user", emailAddress: userEmail, role: "reader" },
      supportsAllDrives: true,
    });
    if (res) console.log(`Added user: ${userEmail} to ${fileId}.`);
    return { skipped: false as const };
  } catch (err) {
    console.error("Error occured in adding user in addPermission.");
    throw err;
  }
};

const getFile = async (fileIdRaw: string) => {
  const fileId = normalizeDriveFileId(fileIdRaw);
  if (!fileId) {
    console.warn(`Invalid Drive file id — cannot fetch ${fileIdRaw}`);
    return null;
  }

  if (!isDriveConfigured()) {
    console.warn(`Drive not configured — cannot fetch file ${fileId}.`);
    return null;
  }

  try {
    const drive = getDrive();
    const res = await drive.files.get({
      fileId,
      fields: "webContentLink",
      supportsAllDrives: true,
    });
    console.log("Got file.", res.data.webContentLink);
    return res.data.webContentLink || null;
  } catch (err) {
    console.error(`Error occured while getting file: ${fileId}`);
    throw err;
  }
};

export { addPermission, getFile, normalizeDriveFileId };
