import fs from "fs";
import path from "path";

export interface Appointment {
  id: string;
  date: string; // Format: DD-MM-YYYY
  time: string; // Format: HH:MM
  contactName: string;
  category: string;
  createdAt: string;
}

export interface CalendarData {
  appointments: Appointment[];
}

const CALENDAR_FILE_NAME = "calendar-data.json";

// In-memory storage for tests
let inMemoryData: CalendarData | null = null;

/**
 * Clear in-memory data for testing
 */
export function clearInMemoryData(): void {
  inMemoryData = null;
}

/**
 * Get the path to the calendar data file
 */
function getCalendarFilePath(): string {
  return path.join(__dirname, "..", "..", "data", CALENDAR_FILE_NAME);
}

/**
 * Ensure the data directory exists
 */
function ensureDataDirectory(): void {
  const dataDir = path.dirname(getCalendarFilePath());
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Initialize calendar data file if it doesn't exist
 */
export function initializeCalendarData(): void {
  ensureDataDirectory();

  const calendarFilePath = getCalendarFilePath();

  if (!fs.existsSync(calendarFilePath)) {
    const initialData: CalendarData = {
      appointments: [],
    };
    fs.writeFileSync(
      calendarFilePath,
      JSON.stringify(initialData, null, 2),
      "utf-8",
    );
    console.log("✅ Calendar data file initialized");
  }
}

/**
 * Load calendar data from file
 */
function loadCalendarData(): CalendarData {
  // Use in-memory storage for tests
  if (process.env.NODE_ENV === "test") {
    if (!inMemoryData) {
      inMemoryData = { appointments: [] };
    }
    return inMemoryData;
  }

  try {
    const calendarFilePath = getCalendarFilePath();

    if (!fs.existsSync(calendarFilePath)) {
      return { appointments: [] };
    }

    const fileContent = fs.readFileSync(calendarFilePath, "utf-8");
    return JSON.parse(fileContent) as CalendarData;
  } catch (error) {
    console.error("❌ Failed to load calendar data:", error);
    return { appointments: [] };
  }
}

/**
 * Save calendar data to file
 */
function saveCalendarData(data: CalendarData): void {
  // Use in-memory storage for tests
  if (process.env.NODE_ENV === "test") {
    inMemoryData = data;
    return;
  }

  try {
    ensureDataDirectory();
    const calendarFilePath = getCalendarFilePath();
    fs.writeFileSync(calendarFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("❌ Failed to save calendar data:", error);
  }
}

/**
 * Parse appointment data from command input
 * Supports multiple date and time formats
 * Format: "DATE. TIME. Contact Name. Category"
 */
export function parseAppointmentInput(input: string): {
  appointment: Omit<Appointment, "id" | "createdAt"> | null;
  error?: string;
} {
  // Split by dots and trim parts
  const parts = input
    .split(".")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length < 4) {
    return {
      appointment: null,
      error: `Expected 4 parts but got ${parts.length}. Format: DATE. TIME. Contact Name. Category`,
    };
  }

  // Join date parts if they were split (e.g., "24.12.2025" becomes ["24", "12", "2025"])
  let dateStr = parts[0];
  let timeStr = parts[1];
  let contactName = parts[2];
  let category = parts[3];

  // If we have more than 4 parts, the date or time might have been split
  if (parts.length > 4) {
    // Try to reconstruct date from first parts
    const potentialDate = parts.slice(0, parts.length - 3).join(".");
    const potentialTime = parts[parts.length - 3];
    const potentialContact = parts[parts.length - 2];
    const potentialCategory = parts[parts.length - 1];

    // Check if this gives us valid date and time
    if (parseDateInput(potentialDate) && parseTimeInput(potentialTime!)) {
      dateStr = potentialDate;
      timeStr = potentialTime;
      contactName = potentialContact;
      category = potentialCategory;
    } else {
      // Try to reconstruct time from parts[1] and parts[2] if they look like time components
      const potentialTime = `${parts[1]}.${parts[2]}`;
      if (parseTimeInput(potentialTime)) {
        timeStr = potentialTime;
        contactName = parts[3];
        category = parts.slice(4).join(".");
      }
    }
  }

  // Parse and validate date format (supports multiple formats)
  const parsedDate = parseDateInput(dateStr!);

  if (!parsedDate) {
    return {
      appointment: null,
      error: `Invalid date format: "${dateStr}". Supported formats: DD-MM-YYYY, DD-MM-YY, DD.MM.YYYY, DD.MM.YY, DDMMYY, DDMMYYYY`,
    };
  }

  // Parse and validate time format (supports multiple formats)
  const parsedTime = parseTimeInput(timeStr!);

  if (!parsedTime) {
    return {
      appointment: null,
      error: `Invalid time format: "${timeStr}". Supported formats: HH:MM, HH.MM`,
    };
  }

  // Validate date components
  const date = new Date(parsedDate.year, parsedDate.month - 1, parsedDate.day);
  if (
    date.getDate() !== parsedDate.day ||
    date.getMonth() !== parsedDate.month - 1 ||
    date.getFullYear() !== parsedDate.year
  ) {
    return {
      appointment: null,
      error: `Invalid date: "${dateStr}" is not a valid calendar date`,
    };
  }

  // Validate time components
  if (
    parsedTime.hours < 0 ||
    parsedTime.hours > 23 ||
    parsedTime.minutes < 0 ||
    parsedTime.minutes > 59
  ) {
    return {
      appointment: null,
      error: `Invalid time: "${timeStr}". Hours must be 00-23, minutes must be 00-59`,
    };
  }

  return {
    appointment: {
      date: parsedDate.formatted,
      time: parsedTime.formatted,
      contactName: contactName!,
      category: category!,
    },
  };
}

/**
 * Add a new appointment to the calendar
 */
export function addAppointment(
  appointmentData: Omit<Appointment, "id" | "createdAt">,
): Appointment {
  const data = loadCalendarData();

  const appointment: Appointment = {
    id: generateId(),
    ...appointmentData,
    createdAt: new Date().toISOString(),
  };

  data.appointments.push(appointment);
  saveCalendarData(data);

  return appointment;
}

/**
 * Get all appointments
 */
export function getAllAppointments(): Appointment[] {
  const data = loadCalendarData();
  return data.appointments.sort((a, b) => {
    // Sort by date and time
    const dateA = parseDate(a.date, a.time);
    const dateB = parseDate(b.date, b.time);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Get appointments for the next 7 days (including today)
 */
export function getAppointmentsForNext7Days(): Appointment[] {
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 6); // +6 to include today + next 6 days

  const allAppointments = getAllAppointments();

  return allAppointments.filter((appointment) => {
    const appointmentDate = parseDate(appointment.date, "00:00");
    return appointmentDate >= today && appointmentDate <= sevenDaysLater;
  });
}

/**
 * Delete an appointment by its index in the displayed list
 */
export function deleteAppointment(index: number): {
  success: boolean;
  deletedAppointment?: Appointment;
  error?: string;
} {
  const data = loadCalendarData();

  if (index < 1 || index > data.appointments.length) {
    return {
      success: false,
      error: `Invalid appointment number. Please use a number between 1 and ${data.appointments.length}`,
    };
  }

  // Remove the appointment at the specified index (1-based in display, 0-based in array)
  const deletedAppointment = data.appointments.splice(index - 1, 1)[0];
  saveCalendarData(data);

  return {
    success: true,
    deletedAppointment,
  };
}

/**
 * Format appointment for display
 */
export function formatAppointment(appointment: Appointment): string {
  return `${appointment.date} ${appointment.time} - ${appointment.contactName} (${appointment.category})`;
}

/**
 * Format multiple appointments for display
 */
export function formatAppointments(appointments: Appointment[]): string {
  if (appointments.length === 0) {
    return "No appointments found.";
  }

  return appointments
    .map(
      (appointment, index) => `${index + 1}. ${formatAppointment(appointment)}`,
    )
    .join("\n");
}

/**
 * Parse date input with multiple supported formats
 */
function parseDateInput(
  dateStr: string,
): { day: number; month: number; year: number; formatted: string } | null {
  // Format 1: DD-MM-YYYY (24-12-2025)
  let match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);

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

  // Format 2: DD-MM-YY (24-12-25)
  match = dateStr.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (match) {
    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!) + 2000; // Assume 21st century
    return { day, month, year, formatted: `${match[1]!}-${match[2]!}-${year}` };
  }

  // Format 3: DD.MM.YYYY (24.12.2025)
  match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

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

  // Format 4: DD.MM.YY (24.12.25)
  match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);

  if (match) {
    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!) + 2000; // Assume 21st century
    return { day, month, year, formatted: `${match[1]!}-${match[2]!}-${year}` };
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
 */
function parseTimeInput(
  timeStr: string,
): { hours: number; minutes: number; formatted: string } | null {
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
 * Helper function to generate unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Helper function to parse date and time
 */
function parseDate(dateStr: string, timeStr: string): Date {
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year!, month! - 1, day!, hours!, minutes!);
}
