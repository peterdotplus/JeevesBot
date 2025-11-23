/**
 * Utility functions for flexible date and time parsing in the frontend
 * Supports the same formats as the backend calendar service
 */

export interface ParsedDate {
  day: number;
  month: number;
  year: number;
  formatted: string; // Always returns DD-MM-YYYY format
}

export interface ParsedTime {
  hours: number;
  minutes: number;
  formatted: string; // Always returns HH:MM format
}

/**
 * Parse date input with multiple supported formats
 * Same formats as backend calendar service
 */
export function parseDateInput(dateStr: string): ParsedDate | null {
  // Format 1: DD-MM-YYYY (24-12-2025) or D-M-YYYY (1-12-2025)
  let match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!);
    return {
      day,
      month,
      year,
      formatted: `${match[1]!.padStart(2, "0")}-${match[2]!.padStart(2, "0")}-${match[3]!}`,
    };
  }

  // Format 2: DD-MM-YY (24-12-25) or D-M-YY (1-12-25)
  match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (match) {
    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!) + 2000; // Assume 21st century
    return {
      day,
      month,
      year,
      formatted: `${match[1]!.padStart(2, "0")}-${match[2]!.padStart(2, "0")}-${year}`,
    };
  }

  // Format 3: DD.MM.YYYY (24.12.2025) or D.M.YYYY (1.12.2025)
  match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (match) {
    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!);
    return {
      day,
      month,
      year,
      formatted: `${match[1]!.padStart(2, "0")}-${match[2]!.padStart(2, "0")}-${match[3]!}`,
    };
  }

  // Format 4: DD.MM.YY (24.12.25) or D.M.YY (1.12.25)
  match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (match) {
    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!) + 2000; // Assume 21st century
    return {
      day,
      month,
      year,
      formatted: `${match[1]!.padStart(2, "0")}-${match[2]!.padStart(2, "0")}-${year}`,
    };
  }

  // Format 5: DDMMYY (241225)
  match = dateStr.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!) + 2000; // Assume 21st century
    return { day, month, year, formatted: `${match[1]!}-${match[2]!}-${year}` };
  }

  // Format 6: DDMMYYYY (24122025)
  match = dateStr.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (match) {
    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!);
    return {
      day,
      month,
      year,
      formatted: `${match[1]!}-${match[2]!}-${match[3]!}`,
    };
  }

  return null;
}

/**
 * Parse time input with multiple supported formats
 * Same formats as backend calendar service
 */
export function parseTimeInput(timeStr: string): ParsedTime | null {
  // Format 1: HH:MM (10:30)
  let match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const hours = parseInt(match[1]!);
    const minutes = parseInt(match[2]!);
    return {
      hours,
      minutes,
      formatted: `${match[1]!.padStart(2, "0")}:${match[2]!}`,
    };
  }

  // Format 2: HH.MM (10.30)
  match = timeStr.match(/^(\d{1,2})\.(\d{2})$/);
  if (match) {
    const hours = parseInt(match[1]!);
    const minutes = parseInt(match[2]!);
    return {
      hours,
      minutes,
      formatted: `${match[1]!.padStart(2, "0")}:${match[2]!}`,
    };
  }

  return null;
}

/**
 * Validate if a date is valid (exists in calendar)
 */
export function isValidDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
}

/**
 * Validate if time is valid
 */
export function isValidTime(hours: number, minutes: number): boolean {
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Get today's date in DD-MM-YYYY format
 */
export function getTodayDate(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Get supported date formats for display in help text
 */
export function getSupportedDateFormats(): string[] {
  return [
    "DD-MM-YYYY (24-12-2025)",
    "DD-MM-YY (24-12-25)",
    "DD.MM.YYYY (24.12.2025)",
    "DD.MM.YY (24.12.25)",
    "DDMMYY (241225)",
    "DDMMYYYY (24122025)",
  ];
}

/**
 * Get supported time formats for display in help text
 */
export function getSupportedTimeFormats(): string[] {
  return [
    "HH:MM (14:30)",
    "HH.MM (14.30)",
  ];
}
