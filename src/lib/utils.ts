import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns YYYY-MM-DD in local time
 */
/**
 * Returns YYYY-MM-DD in UTC (best for cross-timezone consistency)
 */
export function getLocalDateString(date: Date = new Date()) {
  return date.toISOString().split("T")[0];
}

export function removeTypename(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeTypename(item));
  }

  const newObj: any = {};
  for (const key in obj) {
    if (key !== '__typename') {
      newObj[key] = removeTypename(obj[key]);
    }
  }
  return newObj;
}
