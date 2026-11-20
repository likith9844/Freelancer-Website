/**
 * Security Sanitization & Validation Engine
 * Guards against Stored XSS, Injection Attacks, and Enforces Strong Credential Policies
 */

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onerror\s*=/gi, "")
    .replace(/onload\s*=/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .trim();
}

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0 - 4
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    feedback.push("Password must be at least 8 characters long.");
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push("Password must contain at least one lowercase letter.");
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push("Password must contain at least one uppercase letter.");
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push("Password must contain at least one numerical digit.");
  } else {
    score++;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push("Password must contain at least one special character.");
  }

  const isValid = feedback.length === 0 && score >= 4;

  return {
    isValid,
    score,
    feedback,
  };
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const result: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
