// Nepal phone numbers: accept both mobile (10 digits starting with 6-9)
// and landline (7-10 digits, area code varies by region)
export const NEPAL_PHONE_REGEX = /^\d{7,10}$/;

export function normalizeNepalPhone(raw: string): string {
  return raw.trim().replace(/[\s\-]/g, "");
}
