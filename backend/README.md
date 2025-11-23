# JeevesBot Backend

A digital assistant for business management with calendar functionality through a Telegram interface.

## Features

- **Calendar Management**: Add, view, and manage appointments
- **Telegram Integration**: All functionality accessible via Telegram bot
- **7-Day View**: View appointments for today and the next 6 days
- **Current Date Awareness**: All responses include the current date
- **Data Persistence**: File-based storage for appointments and conversation memory

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Testing**: Jest
- **Messaging**: Telegram Bot API

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── config.ts              # Configuration management
│   ├── middleware/
│   │   └── localhostOnly.ts       # Localhost access restriction
│   ├── routes/
│   │   └── telegram.ts            # Telegram webhook routes
│   ├── services/
│   │   ├── calendarService.ts     # Calendar appointment management
│   │   ├── chatService.ts         # Chat message handling
│   │   ├── conversationMemoryService.ts # Conversation history
│   │   └── telegramBotService.ts  # Telegram bot commands
│   └── index.ts                   # Main server file
├── tests/
│   ├── services/                  # Service unit tests
│   └── setup.ts                   # Test configuration
├── data/                          # Data storage (auto-created, gitignored)
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Telegram Bot Token and Chat ID

### 1. Install Dependencies

```bash
npm install
```

### 2. Configuration

**For Development (using .env file):**
Create a `.env` file in the project root with your actual values:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

**For Production/VPS (using config.json):**
```bash
cp config.example.json config.json
```

Edit `config.json` with your actual values:

```json
{
  "telegram": {
    "botToken": "your_telegram_bot_token_here",
    "chatId": "your_telegram_chat_id_here"
  },
  "server": {
    "port": 3001,
    "environment": "production"
  }
}
```

### 3. Get Your Telegram Chat ID

**Method 1: Using the Bot (Recommended)**
1. Start your bot server: `npm run dev`
2. Start a chat with your bot in Telegram
3. Send the command: `/chatid`
4. The bot will reply with your chat ID
5. Add the chat ID to your configuration

**Method 2: Using the Script**
1. Send any message to your bot
2. Run: `node get-chat-id.js YOUR_BOT_TOKEN`
3. The script will display your chat ID

### 4. Run the Application

**Development mode (recommended for coding):**
```bash
npm run dev
```
- No build step required
- Auto-restarts on file changes
- Runs TypeScript directly

**Production mode:**
```bash
npm run build
npm start
```
- Build step compiles TypeScript to JavaScript
- Better performance for production use

### 5. Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage:
```bash
npm run test:coverage
```

## Telegram Bot Commands

### `/help`
Display all available commands with current date.

### `/chatid`
Get your Telegram chat ID for configuration.

### `/addcal`
Add an appointment to the calendar.

**Format:** `/addcal DD-MM-YYYY. HH:MM. Contact Name. Category`

**Example:** `/addcal 21-11-2025. 14:30. Peter van der Meer. Ghostin 06`

**Note:** Use dots (.) as separators between date, time, contact name, and category.

### `/viewcal`
Display all appointments in a list format.

### `/7days`
Display all appointments for today and the next 6 days.

## API Endpoints

### GET `/health`
Health check endpoint to verify the API is running.

**Response:**
```json
{
  "success": true,
  "message": "JeevesBot API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST `/telegram/webhook`
Webhook endpoint for receiving Telegram updates (used in production).

### GET `/telegram/debug`
Debug endpoint to test bot functionality and configuration.

## Setting Up Telegram Bot

1. Create a new bot with [@BotFather](https://t.me/botfather) on Telegram
2. Get your bot token
3. Start a chat with your bot
4. Use `/chatid` command to get your chat ID
5. Add the bot token and chat ID to your configuration

## Development Workflow

This project follows Test-Driven Development (TDD):

1. **RED**: Write failing tests first
2. **GREEN**: Implement minimal code to pass tests  
3. **REFACTOR**: Improve code while maintaining test coverage

### Quick Start for Development:
```bash
npm install          # Install dependencies once
npm run dev          # Start development server (no build needed)
npm test             # Run tests anytime
```

## Data Storage

- **Calendar Data**: Stored in `data/calendar-data.json` (auto-created)
- **Conversation Memory**: Stored in `data/conversation-memory.json` (auto-created)
- **Git Ignored**: Both data files are excluded from version control

The system automatically creates data files with proper structure when they don't exist.

## Configuration

The application supports multiple configuration methods (in order of priority):

1. **Environment Variables** (highest priority)
2. **config.json file** 
3. **System defaults**

### Configuration Options

| Setting | Description | Required | Environment Variable | Config File Path |
|---------|-------------|----------|---------------------|------------------|
| Telegram Bot Token | Telegram bot token | Yes | `TELEGRAM_BOT_TOKEN` | `telegram.botToken` |
| Telegram Chat ID | Target chat ID for messages | Yes | `TELEGRAM_CHAT_ID` | `telegram.chatId` |
| Server Port | Server port | No | `PORT` | `server.port` |
| Environment | Runtime environment | No | `NODE_ENV` | `server.environment` |

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common error scenarios:
- Missing Telegram configuration
- Invalid appointment format
- Network connectivity issues

## Contributing

1. Follow TDD approach: write tests first
2. Ensure all tests pass before committing
3. Maintain code coverage
4. Use TypeScript for type safety

## License

MIT License - see LICENSE file for details