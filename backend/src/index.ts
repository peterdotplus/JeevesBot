import express from "express";
import { config } from "./config/config";
import telegramRoutes from "./routes/telegram";
import { initializeTelegramBot } from "./services/telegramBotService";
import { initializeConversationMemory } from "./services/conversationMemoryService";
import { initializeDailyReminder } from "./services/dailyReminderService";

const app = express();
const PORT = config.server.port;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/telegram", telegramRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JeevesBot API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  },
);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 ------------------------------------- 🚀`);
  const now = new Date();
  console.log(
    `🚀 JeevesBot server running on port ${PORT} since ${now.toLocaleString()}`,
  );
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Telegram webhook: http://localhost:${PORT}/telegram/webhook`);
  console.log(`🌍 Environment: ${config.server.environment}`);

  // Initialize conversation memory
  try {
    initializeConversationMemory();
  } catch (error) {
    console.error("❌ Failed to initialize conversation memory:", error);
  }

  // Initialize Telegram bot
  try {
    await initializeTelegramBot();
  } catch (error) {
    console.error("❌ Failed to initialize Telegram bot:", error);
  }

  // Initialize daily reminder cron job
  try {
    initializeDailyReminder();
  } catch (error) {
    console.error("❌ Failed to initialize daily reminder:", error);
  }
});

export default app;
