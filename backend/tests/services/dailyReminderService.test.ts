import { sendDailyReminder } from "../../src/services/dailyReminderService";
import { telegramBot } from "../../src/services/telegramBotService";
import {
  getAppointmentsForToday,
  formatAppointments,
} from "../../src/services/calendarService";
import { config } from "../../src/config/config";

// Mock dependencies
jest.mock("../../src/services/telegramBotService");
jest.mock("../../src/services/calendarService");
jest.mock("../../src/config/config");

const mockedTelegramBot = telegramBot as jest.Mocked<typeof telegramBot>;
const mockedGetAppointmentsForToday =
  getAppointmentsForToday as jest.MockedFunction<
    typeof getAppointmentsForToday
  >;
const mockedFormatAppointments = formatAppointments as jest.MockedFunction<
  typeof formatAppointments
>;
const mockedConfig = config as jest.Mocked<typeof config>;

describe("Daily Reminder Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock config
    mockedConfig.server = {
      environment: "production",
      port: 3000,
      webhookBaseUrl: "https://example.com",
    };
    mockedConfig.telegram = {
      botToken: "test-token",
      chatId: "123456789",
    };
  });

  describe("sendDailyReminder", () => {
    it("should send daily reminder when there are appointments", async () => {
      // Mock appointments data
      const mockAppointments = [
        {
          id: "1",
          date: "23-11-2025",
          time: "10:00",
          contactName: "Morning Meeting",
          category: "Business",
          createdAt: "2025-11-23T00:00:00.000Z",
        },
      ];

      mockedGetAppointmentsForToday.mockReturnValue(mockAppointments);
      mockedFormatAppointments.mockReturnValue(
        "1. Sunday 23-11-2025 10:00 - Morning Meeting (Business)",
      );

      await sendDailyReminder();

      expect(mockedGetAppointmentsForToday).toHaveBeenCalled();
      expect(mockedFormatAppointments).toHaveBeenCalledWith(mockAppointments);
      expect(mockedTelegramBot.telegram.sendMessage).toHaveBeenCalledWith(
        "123456789",
        expect.stringContaining("📅 *Daily Reminder - Today's Appointments*"),
        { parse_mode: "Markdown" },
      );
    });

    it("should not send daily reminder when there are no appointments", async () => {
      mockedGetAppointmentsForToday.mockReturnValue([]);

      await sendDailyReminder();

      expect(mockedGetAppointmentsForToday).toHaveBeenCalled();
      expect(mockedFormatAppointments).not.toHaveBeenCalled();
      expect(mockedTelegramBot.telegram.sendMessage).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      mockedGetAppointmentsForToday.mockImplementation(() => {
        throw new Error("Database error");
      });

      await sendDailyReminder();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Error sending daily reminder:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
