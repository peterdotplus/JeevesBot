import { telegramBot } from "./telegramBotService";
import { getAppointmentsForToday, formatAppointments } from "./calendarService";
import { config } from "../config/config";
import cron from "node-cron";

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

/**
 * Initialize daily reminder cron job
 * Runs every day at 9:00 AM
 */
export function initializeDailyReminder(): void {
  if (config.server.environment !== "production") {
    console.log("⏰ Daily reminder cron job disabled in non-production environment");
    return;
  }

  if (!config.telegram.chatId) {
    console.log("⏰ Daily reminder cron job disabled - no chat ID configured");
    return;
  }

  // Schedule cron job to run at 9:00 AM every day
  // Cron format: minute hour day month dayOfWeek
  // 0 9 * * * = At 09:00 every day
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Daily reminder cron job triggered at 9:00 AM");
    await sendDailyReminder();
  }, {
    timezone: "Europe/Amsterdam" // Use Netherlands timezone
  });

  console.log("✅ Daily reminder cron job initialized (9:00 AM daily)");
}

/**
 * Manually trigger daily reminder (for testing)
 */
export async function triggerDailyReminder(): Promise<void> {
  console.log("🔔 Manually triggering daily reminder");
  await sendDailyReminder();
}
