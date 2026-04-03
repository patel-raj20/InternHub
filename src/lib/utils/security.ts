/**
 * Security Utility for Project-Wide Input Sanitization
 * Protects against XSS (Cross-Site Scripting) and Logic Injection.
 */

/**
 * Strips dangerous HTML tags and JavaScript event handlers from a string.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return val;

  // 1. Strip script, iframe, object, embed tags entirely
  let clean = val.replace(/<(script|iframe|object|embed|form|frameset|style|link)[^>]*>.*?<\/\1>/gi, '');
  clean = clean.replace(/<(script|iframe|object|embed|form|frameset|style|link)[^>]*>/gi, '');

  // 2. Remove common XSS event handlers (onmouseover, onload, etc.)
  clean = clean.replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Strip javascript: protocols in links/src
  clean = clean.replace(/(?:href|src|action)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '');

  // 4. Basic trimming
  return clean.trim();
}

/**
 * Recursively sanitizes all string values in an object or array.
 * Useful for cleaning form data or GraphQL variables.
 */
export function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  if (typeof data === 'object') {
    const sanitizedObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Skip keys that shouldn't be sanitized (e.g. passwords, hashes, but let's be strict for now)
        // If a field is known to be a password, we might skip it to avoid breaking symbols,
        // but our basic sanitizer is safe for regular symbols.
        sanitizedObj[key] = sanitizeData(data[key]);
      }
    }
    return sanitizedObj;
  }

  return data;
}
