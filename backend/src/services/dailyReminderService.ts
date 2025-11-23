import { telegramBot } from "./telegramBotService";
import { getAppointmentsForToday, formatAppointments } from "./calendarService";
import { config } from "../config/config";

/**
 * Send daily reminder with today's appointments
 */
export async function sendDailyReminder(): Promise<void> {
  try {
    const appointments = getAppointmentsForToday();

    // Only send message if there are appointments
    if (appointments.length === 0) {
      console.log("📅 No appointments for today - skipping daily reminder");
      return;
    }

    const currentDate = new Date().toLocaleDateString("nl-NL");
    const formattedAppointments = formatAppointments(appointments);

    const message = `📅 *Daily Reminder - Today's Appointments*\n\n*Current Date: ${currentDate}*\n\n${formattedAppointments}`;

    // Send message to configured chat ID
    await telegramBot.telegram.sendMessage(
      config.telegram.chatId,
      message,
      { parse_mode: "Markdown" }
    );

    console.log(`✅ Daily reminder sent with ${appointments.length} appointment(s)`);
  } catch (error) {
    console.error("❌ Error sending daily reminder:", error);
  }
}
