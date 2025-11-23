import { Telegraf, Context } from "telegraf";
import { config } from "../config/config";
import {
  parseAppointmentInput,
  addAppointment,
  getAllAppointments,
  getAppointmentsForNext7Days,
  formatAppointments,
  deleteAppointment,
  initializeCalendarData,
} from "./calendarService";

// Initialize bot
const bot = new Telegraf(config.telegram.botToken);

// Initialize calendar data on startup
initializeCalendarData();

// Handle /help command
bot.command("help", async (ctx) => {
  const currentDate = new Date().toLocaleDateString("nl-NL");

  const helpText = `📅 *JeevesBot Calendar Commands* 📅
*Current Date: ${currentDate}*

Available commands:
• /help - Display this help message
• /addcal - Add an appointment to the calendar
  Format: /addcal DATE. TIME. Contact Name. Category
  Example: /addcal 21-11-2025. 14:30. Peter van der Meer. Ghostin 06
  *Date formats:* 24-12-2025, 24-12-25, 24.12.2025, 24.12.25, 241225, 24122025
  *Time formats:* 10:30, 10.30
• /viewcal - Display all appointments
• /7days - Display appointments for today and next 6 days
• /delcal - Delete an appointment
  Format: /delcal NUMBER
  Example: /delcal 3 (to delete the 3rd appointment shown in /viewcal)

*Note:* Use dots (.) as separators between date, time, contact name, and category.`;

  await ctx.reply(helpText, { parse_mode: "Markdown" });
});

// Handle /addcal command
bot.command("addcal", async (ctx) => {
  const currentDate = new Date().toLocaleDateString("nl-NL");
  const messageText = ctx.message.text;

  // Extract the appointment data after the command
  const appointmentData = messageText.replace(/^\/addcal\s+/, "").trim();

  if (!appointmentData) {
    await ctx.reply(
      `❌ *Usage:* /addcal DD-MM-YYYY. HH:MM. Contact Name. Category\n\n*Current Date: ${currentDate}*\n\nExample: /addcal 21-11-2025. 14:30. Peter van der Meer. Ghostin 06`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  try {
    const { appointment: parsedAppointment, error } =
      parseAppointmentInput(appointmentData);

    if (!parsedAppointment) {
      await ctx.reply(
        `❌ *Invalid format!*\n\n*Current Date: ${currentDate}*\n\n${error}\n\nExample: /addcal 21-11-2025. 14:30. Peter van der Meer. Ghostin 06\n\nYour input: "${appointmentData}"`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    const appointment = addAppointment(parsedAppointment);

    await ctx.reply(
      `✅ *Appointment added successfully!*\n\n*Current Date: ${currentDate}*\n\n📅 ${appointment.date} ${appointment.time}\n👤 ${appointment.contactName}\n🏷️ ${appointment.category}`,
      { parse_mode: "Markdown" },
    );
  } catch (error) {
    console.error("Error adding appointment:", error);
    await ctx.reply(
      `❌ *Error adding appointment*\n\n*Current Date: ${currentDate}*\n\nPlease try again or check the format.`,
    );
  }
});

// Handle /viewcal command
bot.command("viewcal", async (ctx) => {
  const currentDate = new Date().toLocaleDateString("nl-NL");

  try {
    const appointments = getAllAppointments();

    if (appointments.length === 0) {
      await ctx.reply(
        `📅 *No appointments found*\n\n*Current Date: ${currentDate}*\n\nUse /addcal to add your first appointment.`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    const formattedAppointments = formatAppointments(appointments);

    await ctx.reply(
      `📅 *All Appointments*\n\n*Current Date: ${currentDate}*\n\n${formattedAppointments}`,
      { parse_mode: "Markdown" },
    );
  } catch (error) {
    console.error("Error viewing appointments:", error);
    await ctx.reply(
      `❌ *Error retrieving appointments*\n\n*Current Date: ${currentDate}*\n\nPlease try again.`,
    );
  }
});

// Handle /7days command
bot.command("7days", async (ctx) => {
  const currentDate = new Date().toLocaleDateString("nl-NL");
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 6);

  const dateRange = `${today.toLocaleDateString("nl-NL")} - ${sevenDaysLater.toLocaleDateString("nl-NL")}`;

  try {
    const appointments = getAppointmentsForNext7Days();

    if (appointments.length === 0) {
      await ctx.reply(
        `📅 *No appointments for the next 7 days*\n\n*Current Date: ${currentDate}*\n*Date Range: ${dateRange}*\n\nUse /addcal to add appointments.`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    const formattedAppointments = formatAppointments(appointments);

    await ctx.reply(
      `📅 *Appointments for Next 7 Days*\n\n*Current Date: ${currentDate}*\n*Date Range: ${dateRange}*\n\n${formattedAppointments}`,
      { parse_mode: "Markdown" },
    );
  } catch (error) {
    console.error("Error viewing 7-day appointments:", error);
    await ctx.reply(
      `❌ *Error retrieving appointments*\n\n*Current Date: ${currentDate}*\n\nPlease try again.`,
    );
  }
});

// Handle /delcal command
bot.command("delcal", async (ctx) => {
  const currentDate = new Date().toLocaleDateString("nl-NL");
  const messageText = ctx.message.text;

  // Extract the appointment number after the command
  const appointmentNumber = messageText.replace(/^\/delcal\s+/, "").trim();

  if (!appointmentNumber) {
    await ctx.reply(
      `❌ *Usage:* /delcal NUMBER\n\n*Current Date: ${currentDate}*\n\nExample: /delcal 3 (to delete the 3rd appointment shown in /viewcal)\n\nUse /viewcal first to see the appointment numbers.`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  // Parse the appointment number
  const number = parseInt(appointmentNumber);
  if (isNaN(number)) {
    await ctx.reply(
      `❌ *Invalid number!*\n\n*Current Date: ${currentDate}*\n\nPlease provide a valid number. Example: /delcal 3`,
      { parse_mode: "Markdown" },
    );
    return;
  }

  try {
    const { success, deletedAppointment, error } = deleteAppointment(number);

    if (!success) {
      await ctx.reply(
        `❌ *Error deleting appointment*\n\n*Current Date: ${currentDate}*\n\n${error}`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    if (!deletedAppointment) {
      await ctx.reply(
        `❌ *Error deleting appointment*\n\n*Current Date: ${currentDate}*\n\nNo appointment found to delete.`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    await ctx.reply(
      `🗑️ *Appointment deleted successfully!*\n\n*Current Date: ${currentDate}*\n\n📅 ${deletedAppointment.date} ${deletedAppointment.time}\n👤 ${deletedAppointment.contactName}\n🏷️ ${deletedAppointment.category}\n\nAppointment #${number} has been removed from your calendar.`,
      { parse_mode: "Markdown" },
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    await ctx.reply(
      `❌ *Error deleting appointment*\n\n*Current Date: ${currentDate}*\n\nPlease try again.`,
    );
  }
});

// Handle /start command
bot.command("start", async (ctx) => {
  const currentDate = new Date().toLocaleDateString("nl-NL");

  await ctx.reply(
    `👋 *Welcome to JeevesBot Calendar!* 👋\n\n*Current Date: ${currentDate}*\n\nI'm your personal calendar assistant. Use /help to see all available commands.`,
    { parse_mode: "Markdown" },
  );
});

// Handle text messages (non-command chat)
bot.on("text", async (ctx) => {
  const message = ctx.message.text;
  const userId = ctx.from?.id;
  const currentDate = new Date().toLocaleDateString("nl-NL");

  if (!userId) {
    console.warn("Received text message without user ID");
    return;
  }

  // If it's a slash command, let the command handlers handle it
  if (message.startsWith("/")) {
    return;
  }

  try {
    // For now, respond with help message for regular chat
    await ctx.reply(
      `📅 *JeevesBot Calendar*\n\n*Current Date: ${currentDate}*\n\nI'm focused on calendar management. Use /help to see available commands for managing appointments.`,
      { parse_mode: "Markdown" },
    );
  } catch (error) {
    console.error("Error handling chat message:", error);
    await ctx.reply(
      `❌ *Error processing message*\n\n*Current Date: ${currentDate}*\n\nPlease try again or use /help for assistance.`,
    );
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Export bot instance and initialization function
export const telegramBot = bot;

export async function initializeTelegramBot(): Promise<void> {
  try {
    console.log("🤖 Initializing Telegram bot...");
    console.log(`🤖 Environment: ${config.server.environment}`);
    console.log(
      `🤖 Bot token configured: ${config.telegram.botToken ? "Yes" : "No"}`,
    );

    // For non-production environments, use polling instead of webhook
    if (config.server.environment !== "production") {
      console.log("🤖 Starting Telegram bot in polling mode...");
      await bot.launch();
      console.log("✅ Telegram bot started successfully in polling mode");
    } else {
      console.log("🤖 Telegram bot ready for webhook setup...");
    }

    console.log("✅ Telegram bot service initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Telegram bot:", error);
    throw error;
  }
}

export async function stopTelegramBot(): Promise<void> {
  await bot.stop();
}
