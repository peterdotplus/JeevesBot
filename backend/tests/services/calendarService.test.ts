import {
  parseAppointmentInput,
  addAppointment,
  getAllAppointments,
  getAppointmentsForNext7Days,
  formatAppointment,
  formatAppointments,
  deleteAppointment,
  initializeCalendarData,
  Appointment,
} from "../../src/services/calendarService";
import fs from "fs";
import path from "path";

// Mock the file system operations
jest.mock("fs");
jest.mock("path");

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

describe("Calendar Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the in-memory data for tests
    const calendarService = require("../../src/services/calendarService");
    calendarService.clearInMemoryData();
  });

  describe("parseAppointmentInput", () => {
    it("should parse valid appointment input correctly", () => {
      const input = "21-11-2025. 14:30. Peter van der Meer. Ghostin 06";
      const result = parseAppointmentInput(input);

      expect(result.appointment).toEqual({
        date: "21-11-2025",
        time: "14:30",
        contactName: "Peter van der Meer",
        category: "Ghostin 06",
      });
    });

    it("should handle extra spaces between parts", () => {
      const input = "21-11-2025.   14:30.   Peter van der Meer.   Ghostin 06";
      const result = parseAppointmentInput(input);

      expect(result.appointment).toEqual({
        date: "21-11-2025",
        time: "14:30",
        contactName: "Peter van der Meer",
        category: "Ghostin 06",
      });
    });

    it("should return null for invalid date format", () => {
      const input = "21/11/2025. 14:30. Peter van der Meer. Ghostin 06";
      const result = parseAppointmentInput(input);
      expect(result.appointment).toBeNull();
    });

    it("should support multiple date formats", () => {
      // Test DD-MM-YYYY
      let result = parseAppointmentInput(
        "24-12-2025. 10:30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "10:30",
        contactName: "Test Contact",
        category: "Test Category",
      });

      // Test DD-MM-YY
      result = parseAppointmentInput(
        "24-12-25. 10:30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "10:30",
        contactName: "Test Contact",
        category: "Test Category",
      });

      // Test DD.MM.YYYY
      result = parseAppointmentInput(
        "24.12.2025. 10:30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "10:30",
        contactName: "Test Contact",
        category: "Test Category",
      });

      // Test DD.MM.YY
      result = parseAppointmentInput(
        "24.12.25. 10:30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "10:30",
        contactName: "Test Contact",
        category: "Test Category",
      });

      // Test DDMMYY
      result = parseAppointmentInput(
        "241225. 10:30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "10:30",
        contactName: "Test Contact",
        category: "Test Category",
      });

      // Test DDMMYYYY
      result = parseAppointmentInput(
        "24122025. 10:30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "10:30",
        contactName: "Test Contact",
        category: "Test Category",
      });
    });

    it("should support multiple time formats", () => {
      // Test HH:MM
      let result = parseAppointmentInput(
        "24-12-2025. 10:30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "10:30",
        contactName: "Test Contact",
        category: "Test Category",
      });

      // Test HH.MM
      result = parseAppointmentInput(
        "24-12-2025. 10.30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "10:30",
        contactName: "Test Contact",
        category: "Test Category",
      });

      // Test single digit hours with colon
      result = parseAppointmentInput(
        "24-12-2025. 9:30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "09:30",
        contactName: "Test Contact",
        category: "Test Category",
      });

      // Test single digit hours with dot
      result = parseAppointmentInput(
        "24-12-2025. 9.30. Test Contact. Test Category",
      );
      expect(result.appointment).toEqual({
        date: "24-12-2025",
        time: "09:30",
        contactName: "Test Contact",
        category: "Test Category",
      });
    });

    it("should return null for invalid time format", () => {
      const input = "21-11-2025. 14:30:00. Peter van der Meer. Ghostin 06";
      const result = parseAppointmentInput(input);
      expect(result.appointment).toBeNull();
    });

    it("should return null for invalid date (non-existent date)", () => {
      const input = "31-02-2025. 14:30. Peter van der Meer. Ghostin 06";
      const result = parseAppointmentInput(input);
      expect(result.appointment).toBeNull();
    });

    it("should return null for invalid time (hours out of range)", () => {
      const input = "21-11-2025. 25:30. Peter van der Meer. Ghostin 06";
      const result = parseAppointmentInput(input);
      expect(result.appointment).toBeNull();
    });

    it("should return null for invalid time (minutes out of range)", () => {
      const input = "21-11-2025. 14:60. Peter van der Meer. Ghostin 06";
      const result = parseAppointmentInput(input);
      expect(result.appointment).toBeNull();
    });

    it("should return null for insufficient parts", () => {
      const input = "21-11-2025. 14:30. Peter van der Meer";
      const result = parseAppointmentInput(input);
      expect(result.appointment).toBeNull();
    });

    it("should return null for empty input", () => {
      const input = "";
      const result = parseAppointmentInput(input);
      expect(result.appointment).toBeNull();
    });
  });

  describe("addAppointment", () => {
    it("should add a valid appointment", () => {
      const appointmentData = {
        date: "21-11-2025",
        time: "14:30",
        contactName: "Peter van der Meer",
        category: "Ghostin 06",
      };

      const result = addAppointment(appointmentData);

      expect(result).toMatchObject({
        ...appointmentData,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("should generate unique IDs for different appointments", () => {
      const appointmentData1 = {
        date: "21-11-2025",
        time: "14:30",
        contactName: "Peter van der Meer",
        category: "Ghostin 06",
      };

      const appointmentData2 = {
        date: "22-11-2025",
        time: "10:00",
        contactName: "John Doe",
        category: "Meeting",
      };

      const result1 = addAppointment(appointmentData1);
      const result2 = addAppointment(appointmentData2);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("getAllAppointments", () => {
    beforeEach(() => {
      // Add some test appointments
      addAppointment({
        date: "25-11-2025",
        time: "10:00",
        contactName: "John Doe",
        category: "Meeting",
      });

      addAppointment({
        date: "21-11-2025",
        time: "14:30",
        contactName: "Peter van der Meer",
        category: "Ghostin 06",
      });

      addAppointment({
        date: "22-11-2025",
        time: "09:00",
        contactName: "Jane Smith",
        category: "Call",
      });
    });

    it("should return all appointments sorted by date and time", () => {
      const appointments = getAllAppointments();

      expect(appointments).toHaveLength(3);
      expect(appointments[0]?.date).toBe("21-11-2025");
      expect(appointments[1]?.date).toBe("22-11-2025");
      expect(appointments[2]?.date).toBe("25-11-2025");
    });
  });

  describe("getAppointmentsForNext7Days", () => {
    beforeEach(() => {
      // Mock the current date to be 2025-11-20
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 10, 20)); // Month is 0-indexed
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should return appointments within the next 7 days", () => {
      // Add appointments for different dates
      addAppointment({
        date: "20-11-2025", // Today
        time: "10:00",
        contactName: "Today Appointment",
        category: "Meeting",
      });

      addAppointment({
        date: "25-11-2025", // Within 7 days
        time: "14:30",
        contactName: "Within 7 days",
        category: "Call",
      });

      addAppointment({
        date: "26-11-2025", // Within 7 days (20 + 6 = 26)
        time: "09:00",
        contactName: "6 days later",
        category: "Appointment",
      });

      addAppointment({
        date: "29-11-2025", // Outside 7 days
        time: "16:00",
        contactName: "Outside 7 days",
        category: "Meeting",
      });

      const result = getAppointmentsForNext7Days();

      expect(result).toHaveLength(3);
      expect(result.map((a) => a.contactName)).toEqual([
        "Today Appointment",
        "Within 7 days",
        "6 days later",
      ]);
    });

    it("should return empty array when no appointments in next 7 days", () => {
      addAppointment({
        date: "29-11-2025", // Outside 7 days
        time: "16:00",
        contactName: "Outside 7 days",
        category: "Meeting",
      });

      const result = getAppointmentsForNext7Days();
      expect(result).toHaveLength(0);
    });
  });

  describe("formatAppointment", () => {
    it("should format appointment correctly", () => {
      const appointment: Appointment = {
        id: "test-id",
        date: "21-11-2025",
        time: "14:30",
        contactName: "Peter van der Meer",
        category: "Ghostin 06",
        createdAt: "2025-01-01T00:00:00.000Z",
      };

      const result = formatAppointment(appointment);
      expect(result).toBe("21-11-2025 14:30 - Peter van der Meer (Ghostin 06)");
    });
  });

  describe("deleteAppointment", () => {
    beforeEach(() => {
      // Add some test appointments
      addAppointment({
        date: "21-11-2025",
        time: "14:30",
        contactName: "Peter van der Meer",
        category: "Ghostin 06",
      });

      addAppointment({
        date: "22-11-2025",
        time: "10:00",
        contactName: "John Doe",
        category: "Meeting",
      });

      addAppointment({
        date: "23-11-2025",
        time: "09:00",
        contactName: "Jane Smith",
        category: "Call",
      });
    });

    it("should delete appointment by valid index", () => {
      const initialAppointments = getAllAppointments();
      expect(initialAppointments).toHaveLength(3);

      const result = deleteAppointment(2); // Delete the second appointment
      expect(result.success).toBe(true);
      expect(result.deletedAppointment?.contactName).toBe("John Doe");

      const remainingAppointments = getAllAppointments();
      expect(remainingAppointments).toHaveLength(2);
      expect(remainingAppointments[0]?.contactName).toBe("Peter van der Meer");
      expect(remainingAppointments[1]?.contactName).toBe("Jane Smith");
    });

    it("should return error for index less than 1", () => {
      const result = deleteAppointment(0);
      expect(result.success).toBe(false);
      expect(result.deletedAppointment).toBeUndefined();
      expect(result.error).toContain("Invalid appointment number");
    });

    it("should return error for index greater than appointments length", () => {
      const result = deleteAppointment(5);
      expect(result.success).toBe(false);
      expect(result.deletedAppointment).toBeUndefined();
      expect(result.error).toContain("Invalid appointment number");
    });

    it("should handle deleting the first appointment", () => {
      const result = deleteAppointment(1);
      expect(result.success).toBe(true);
      expect(result.deletedAppointment?.contactName).toBe("Peter van der Meer");

      const remainingAppointments = getAllAppointments();
      expect(remainingAppointments).toHaveLength(2);
      expect(remainingAppointments[0]?.contactName).toBe("John Doe");
    });

    it("should handle deleting the last appointment", () => {
      const result = deleteAppointment(3);
      expect(result.success).toBe(true);
      expect(result.deletedAppointment?.contactName).toBe("Jane Smith");

      const remainingAppointments = getAllAppointments();
      expect(remainingAppointments).toHaveLength(2);
      expect(remainingAppointments[1]?.contactName).toBe("John Doe");
    });

    it("should return error when no appointments exist", () => {
      // Clear all appointments
      const calendarService = require("../../src/services/calendarService");
      calendarService.clearInMemoryData();

      const result = deleteAppointment(1);
      expect(result.success).toBe(false);
      expect(result.deletedAppointment).toBeUndefined();
      expect(result.error).toContain("Invalid appointment number");
    });
  });

  describe("formatAppointments", () => {
    it("should format multiple appointments correctly", () => {
      const appointments: Appointment[] = [
        {
          id: "1",
          date: "21-11-2025",
          time: "14:30",
          contactName: "Peter van der Meer",
          category: "Ghostin 06",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          date: "22-11-2025",
          time: "10:00",
          contactName: "John Doe",
          category: "Meeting",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ];

      const result = formatAppointments(appointments);
      expect(result).toBe(
        "1. 21-11-2025 14:30 - Peter van der Meer (Ghostin 06)\n2. 22-11-2025 10:00 - John Doe (Meeting)",
      );
    });

    it("should return message for empty appointments", () => {
      const result = formatAppointments([]);
      expect(result).toBe("No appointments found.");
    });
  });

  describe("initializeCalendarData", () => {
    it("should create data directory and file if they don't exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedPath.join.mockReturnValue("/test/data/calendar-data.json");
      mockedPath.dirname.mockReturnValue("/test/data");

      initializeCalendarData();

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith("/test/data", {
        recursive: true,
      });
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        "/test/data/calendar-data.json",
        JSON.stringify({ appointments: [] }, null, 2),
        "utf-8",
      );
    });

    it("should not create file if it already exists", () => {
      mockedFs.existsSync.mockReturnValue(true);

      initializeCalendarData();

      expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
    });
  });
});
