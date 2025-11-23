const axios = require('axios');

/**
 * Simple script to get your Telegram chat ID
 *
 * Usage:
 * 1. Create a Telegram bot via @BotFather and get the bot token
 * 2. Start a chat with your bot
 * 3. Send any message to the bot
 * 4. Run this script with your bot token to get the chat ID
 *
 * Command: node get-chat-id.js YOUR_BOT_TOKEN
 */

async function getChatId(botToken) {
  if (!botToken) {
    console.error('❌ Please provide your bot token as an argument');
    console.log('Usage: node get-chat-id.js YOUR_BOT_TOKEN');
    process.exit(1);
  }

  try {
    // Get recent updates from the bot
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/getUpdates`);

    if (!response.data.ok) {
      console.error('❌ Error from Telegram API:', response.data.description);
      process.exit(1);
    }

    const updates = response.data.result;

    if (updates.length === 0) {
      console.log('📱 No messages found from your bot.');
      console.log('💡 Please send a message to your bot first, then run this script again.');
      return;
    }

    // Get the most recent message
    const latestUpdate = updates[updates.length - 1];
    const chatId = latestUpdate.message?.chat?.id || latestUpdate.my_chat_member?.chat?.id;

    if (!chatId) {
      console.error('❌ Could not find chat ID in the updates');
      console.log('📋 Available updates:', JSON.stringify(updates, null, 2));
      return;
    }

    console.log('✅ Chat ID found!');
    console.log(`📱 Your Chat ID: ${chatId}`);
    console.log('');
    console.log('💡 Add this to your config.json:');
    console.log(`"chatId": "${chatId}"`);
    console.log('');
    console.log('📋 Recent messages found:');
    updates.forEach((update, index) => {
      const message = update.message;
      if (message) {
        const from = message.from?.first_name || 'Unknown';
        const text = message.text || '(no text)';
        const date = new Date(message.date * 1000).toLocaleString();
        console.log(`  ${index + 1}. ${from}: "${text}" (${date})`);
      }
    });

  } catch (error) {
    console.error('❌ Error getting chat ID:');
    if (error.response) {
      console.error('   Telegram API error:', error.response.data.description);
    } else if (error.code === 'ENOTFOUND') {
      console.error('   Network error: Cannot connect to Telegram API');
    } else {
      console.error('   Unknown error:', error.message);
    }
    console.log('');
    console.log('💡 Make sure your bot token is correct and you have sent a message to the bot.');
  }
}

// Get bot token from command line arguments
const botToken = process.argv[2];
getChatId(botToken);
