const SENSITIVE_KEYS = new Set([
  "fileId",
  "fileid",
  "driveLink",
  "driveUrl",
  "link",
]);

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // mongoose docs
    const plain =
      typeof (obj as { toObject?: () => Record<string, unknown> }).toObject ===
      "function"
        ? (obj as { toObject: () => Record<string, unknown> }).toObject()
        : obj;

    const next: Record<string, unknown> = {};
    Object.entries(plain).forEach(([key, val]) => {
      if (SENSITIVE_KEYS.has(key)) return;
      // Drop obvious drive URLs even under other keys
      if (
        typeof val === "string" &&
        /drive\.google\.com|docs\.google\.com/i.test(val)
      ) {
        return;
      }
      next[key] = sanitizeValue(val);
    });
    return next;
  }
  return value;
};

export const stripSensitiveModuleFields = <T>(data: T): T =>
  sanitizeValue(data) as T;
