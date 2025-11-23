# JeevesBot

A digital assistant for business management with calendar functionality through a Telegram interface.

## Overview

JeevesBot is a Telegram-based digital assistant designed to help manage business appointments and calendar events. It provides a simple, intuitive interface for adding, viewing, and managing appointments directly through Telegram.

## Features

- **📅 Calendar Management**: Add, view, and manage appointments
- **🤖 Telegram Integration**: All functionality accessible via Telegram bot
- **📱 7-Day View**: View appointments for today and the next 6 days
- **📅 Current Date Awareness**: All responses include the current date
- **💾 Data Persistence**: File-based storage for appointments
- **🛡️ Test-Driven Development**: Comprehensive test coverage

## Quick Start

### 1. Prerequisites
- Node.js (v16 or higher)
- Telegram Bot Token (from @BotFather)

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd JeevesBot

# Install dependencies
npm install

# Or install backend dependencies directly
cd backend && npm install
```

### 3. Configuration
1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
2. Copy `backend/config.example.json` to `backend/config.json`
3. Add your bot token to the configuration
4. Start the bot and use the chat ID script to get your chat ID
5. Add the chat ID to your configuration

### 4. Running the Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

## Telegram Bot Commands

- `/help` - Display all available commands

- `/addcal` - Add an appointment (format: DD-MM-YYYY. HH:MM. Contact Name. Category)
- `/viewcal` - Display all appointments
- `/7days` - Display appointments for next 7 days

**Example:**
```
/addcal 21-11-2025. 14:30. Peter van der Meer. Ghostin 06
```

## Getting Your Telegram Chat ID

Use the provided script to get your chat ID:

```bash
cd backend
node get-chat-id.js YOUR_BOT_TOKEN
```

This will display your chat ID which you need to add to your configuration.

## Project Structure

```
JeevesBot/
├── backend/                 # Backend application
│   ├── src/                # Source code
│   │   ├── config/         # Configuration management
│   │   ├── services/       # Business logic services
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Main server file
│   ├── tests/              # Test suite
│   ├── data/               # Data storage (auto-created)
│   └── package.json
├── README.md               # This file
└── package.json            # Root package.json
```

## Development

### Running Tests
```bash
cd backend
npm test
```

### Building for Production
```bash
cd backend
npm run build
```

## Configuration

The application supports multiple configuration methods:

1. **Environment Variables** (highest priority)
2. **config.json file** in backend directory
3. **System defaults**

Required configuration:
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `TELEGRAM_CHAT_ID` - Your chat ID (use `/chatid` command to get it)

## Data Storage

- Calendar data is stored in `backend/data/calendar-data.json`
- Conversation memory is stored in `backend/data/conversation-memory.json`
- Data files are automatically created when they don't exist
- Data files are excluded from version control via `.gitignore`

## API Endpoints

- `GET /health` - Health check
- `POST /telegram/webhook` - Telegram webhook (production)
- `GET /telegram/debug` - Debug information

## Contributing

This project follows Test-Driven Development (TDD):
1. **RED** - Write failing tests first
2. **GREEN** - Implement minimal code to pass tests
3. **REFACTOR** - Improve code while maintaining test coverage

## License

MIT License - see LICENSE file for details