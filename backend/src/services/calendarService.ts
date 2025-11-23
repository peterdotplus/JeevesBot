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
 * Format: "DD-MM-YYYY. HH:MM. Contact Name. Category"
 */
export function parseAppointmentInput(
  input: string,
): Omit<Appointment, "id" | "createdAt"> | null {
  const parts = input
    .split(".")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length < 4) {
    return null;
  }

  const dateStr = parts[0];
  const timeStr = parts[1];
  const contactName = parts[2];
  const category = parts[3];

  // Validate date format (DD-MM-YYYY)
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateRegex.test(dateStr!)) {
    return null;
  }

  // Validate time format (HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(timeStr!)) {
    return null;
  }

  // Validate date components
  const [day, month, year] = dateStr!.split("-").map(Number);
  const date = new Date(year!, month! - 1, day!);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month! - 1 ||
    date.getFullYear() !== year
  ) {
    return null;
  }

  // Validate time components
  const [hours, minutes] = timeStr!.split(":").map(Number);
  if (hours! < 0 || hours! > 23 || minutes! < 0 || minutes! > 59) {
    return null;
  }

  return {
    date: dateStr!,
    time: timeStr!,
    contactName: contactName!,
    category: category!,
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
