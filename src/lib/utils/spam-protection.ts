// List of disposable email domains to block
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "temp-mail.org",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwaway.email",
  "temp-mail.io",
  "yopmail.com",
  "maildrop.cc",
  "sharklasers.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Nepal phone: 10 digits starting with 9, 8, 7, 6
  const phoneRegex = /^[6789]\d{9}$/;
  return phoneRegex.test(phone);
}
