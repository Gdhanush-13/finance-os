/**
 * Strips empty-string values from a payload so optional ObjectId fields
 * don't fail server-side validation (server expects valid 24-char hex or undefined).
 */
export function cleanPayload<T extends Record<string, unknown>>(payload: T): T {
  const cleaned = { ...payload };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === "") {
      delete cleaned[key];
    }
  }
  return cleaned;
}
