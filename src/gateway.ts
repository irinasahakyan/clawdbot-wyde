import { Client, GatewayIntentBits, Events, ActivityType } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  console.error('Error: DISCORD_TOKEN environment variable is not set');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Clawdbot is online! Logged in as ${readyClient.user.tag}`);
  console.log(`Connected to ${readyClient.guilds.cache.size} server(s)`);

  readyClient.user.setActivity('WYDE Markets', { type: ActivityType.Watching });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user!);
  const isDM = !message.guild;

  if (isMentioned || isDM) {
    const content = message.content.replace(/<@!?\d+>/g, '').trim();

    if (!content) {
      await message.reply('Hey there! I\'m Clawdbot, your WYDE trading assistant. How can I help you today? Try asking about prices, swaps, or your impact stats!');
      return;
    }

    await message.reply(`I received your message: "${content}". Full AI integration coming soon!`);
  }
});

client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

console.log('Starting Clawdbot gateway...');
client.login(DISCORD_TOKEN);
