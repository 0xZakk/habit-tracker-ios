/**
 * Normalizes a Date object to midnight (00:00:00.000) in the local timezone
 * @param date The date to normalize
 * @returns A new Date object set to midnight of the input date
 */
export function normalizeToDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
} 