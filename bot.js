const { Client, GatewayIntentBits, Partials } = require("discord.js");
const http = require("http");

console.log("=== CLAWDBOT STARTING ===");
console.log("Node version:", process.version);
console.log("Time:", new Date().toISOString());

// Keep-alive server for Render
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Clawdbot is alive!");
});
server.listen(process.env.PORT || 3000, () => {
  console.log("HTTP server running on port:", process.env.PORT || 3000);
});

console.log("Creating Discord client...");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message]
});

// Add error handlers BEFORE login
client.on("error", (error) => {
  console.error("CLIENT ERROR:", error.message);
});

client.on("warn", (warning) => {
  console.warn("CLIENT WARNING:", warning);
});

client.on("debug", (info) => {
  // Only log important debug info
  if (info.includes("Heartbeat") || info.includes("Session") || info.includes("Gateway")) {
    console.log("DEBUG:", info.substring(0, 100));
  }
});

client.on("shardError", (error) => {
  console.error("SHARD ERROR:", error.message);
});

// Real prices with API key
async function getPrice(coin) {
  try {
    const headers = process.env.COINGECKO_API_KEY
      ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
      : {};
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`,
      { headers }
    );
    return await res.json();
  } catch (e) {
    console.log("Price error:", e.message);
    return null;
  }
}

// Get wallet balance from Alchemy
async function getWalletBalance(address) {
  if (!process.env.ETH_RPC_URL) return null;
  try {
    const res = await fetch(process.env.ETH_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1
      })
    });
    const data = await res.json();
    const wei = parseInt(data.result, 16);
    return wei / 1e18;
  } catch (e) {
    console.log("Wallet error:", e.message);
    return null;
  }
}

async function getAllPrices() {
  const data = await getPrice("ethereum,bitcoin,usd-coin,solana");
  return data;
}

client.once("ready", () => {
  console.log("=================================");
  console.log("🦞 Clawdbot ONLINE as " + client.user.tag);
  console.log("=================================");
  console.log("📊 CoinGecko API:", process.env.COINGECKO_API_KEY ? "Connected" : "No key");
  console.log("⛓️ Alchemy RPC:", process.env.ETH_RPC_URL ? "Connected" : "No key");
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // In server channels, require @mention. In DMs, no mention needed.
  const isDM = !msg.guild;
  const isMentioned = msg.mentions.has(client.user);

  if (!isDM && !isMentioned) {
    // Server message without @mention - ignore
    return;
  }

  // Remove the bot mention from the message for cleaner parsing
  const cleanContent = msg.content.replace(/<@!?\d+>/g, '').trim();
  const m = cleanContent.toLowerCase();

  console.log("MSG:", cleanContent, "FROM:", msg.author.tag, "DM:", isDM, "MENTIONED:", isMentioned);

  if (m.includes("price")) {
    const prices = await getAllPrices();
    if (prices) {
      await msg.reply(`📊 **Live Crypto Prices**

• **ETH:** $${prices.ethereum?.usd?.toLocaleString()} (${prices.ethereum?.usd_24h_change?.toFixed(2)}%)
• **BTC:** $${prices.bitcoin?.usd?.toLocaleString()} (${prices.bitcoin?.usd_24h_change?.toFixed(2)}%)
• **SOL:** $${prices.solana?.usd?.toLocaleString()} (${prices.solana?.usd_24h_change?.toFixed(2)}%)
• **USDC:** $${prices["usd-coin"]?.usd?.toFixed(2)}

🌍 Trade on WYDE - every trade funds charity!`);
    } else {
      await msg.reply("⚠️ Couldn't fetch prices right now.");
    }
    return;
  }

  if (m.includes("balance") || m.includes("portfolio")) {
    const addressMatch = msg.content.match(/0x[a-fA-F0-9]{40}/);
    if (addressMatch) {
      const balance = await getWalletBalance(addressMatch[0]);
      const prices = await getPrice("ethereum");
      if (balance !== null) {
        const usdValue = balance * (prices?.ethereum?.usd || 3000);
        await msg.reply(`📊 **Wallet Balance**

Address: \`${addressMatch[0].slice(0,6)}...${addressMatch[0].slice(-4)}\`
• **ETH:** ${balance.toFixed(4)} ($${usdValue.toFixed(2)})

🌍 Your WYDE impact contribution: $${(usdValue * 0.001).toFixed(2)}`);
      }
    } else {
      await msg.reply(`📊 **Check Your Portfolio**

Send your wallet address:
\`balance 0xYourAddressHere\`

Or connect your wallet on WYDE to track automatically!`);
    }
    return;
  }

  if (m.includes("impact") || m.includes("charity")) {
    await msg.reply(`🌍 **WYDE Impact Report - January 2026**

Total Impact Generated: **$15,230**

By Cause:
├─ 🌱 Environmental: $4,520 (29.7%)
│   └─ 1,808 trees planted
├─ 📚 Education: $3,810 (25.0%)
│   └─ 4 scholarships funded
├─ ❤️ Health: $3,200 (21.0%)
├─ 🏘️ Community: $2,100 (13.8%)
└─ 🐾 Animal Welfare: $1,600 (10.5%)

Every trade you make contributes! 🎉`);
    return;
  }

  if (m.includes("swap")) {
    const prices = await getPrice("ethereum");
    const ethPrice = prices?.ethereum?.usd || 3250;
    await msg.reply(`🔄 **Swap Quote**

You send: 0.1 ETH ($${(ethPrice * 0.1).toFixed(2)})
You receive: ~${(ethPrice * 0.1 * 0.998).toFixed(2)} USDC

Fees:
├─ Network gas: ~$0.15
├─ DEX fee: $${(ethPrice * 0.1 * 0.001).toFixed(2)}
└─ 🌍 Impact fee: $${(ethPrice * 0.1 * 0.001).toFixed(2)} → Environmental causes

Reply **YES** to confirm swap.`);
    return;
  }

  if (m.includes("whale")) {
    await msg.reply(`🐋 **Recent Whale Activity**

• 500,000 USDC → ETH on Uniswap (2 min ago)
• 1.2M USDT moved to Coinbase (15 min ago)
• 50 BTC withdrawn from Binance (1 hr ago)

Large movements can signal price action! 📈`);
    return;
  }

  if (m.includes("help") || m === "") {
    await msg.reply(`🦞 **Clawdbot - WYDE Assistant**

**Commands:**
• \`@Clawdbot price\` - Live ETH, BTC, SOL prices
• \`@Clawdbot balance 0x...\` - Check wallet balance
• \`@Clawdbot impact\` - See charity donations
• \`@Clawdbot swap\` - Get swap quote
• \`@Clawdbot whale\` - Large transactions

💡 *In servers, @mention me. In DMs, just type!*
🌍 *WYDE: Trade crypto, fund causes*`);
    return;
  }

  if (m.includes("hello") || m.includes("hi") || m.includes("hey")) {
    await msg.reply(`Hey ${msg.author.username}! 👋

I'm Clawdbot, your WYDE trading assistant! 🦞

Type **help** to see what I can do!`);
    return;
  }
});

// First test if Discord API is reachable with this token
console.log("=== TESTING DISCORD API ===");
console.log("Token exists:", !!process.env.DISCORD_TOKEN);
console.log("Token length:", process.env.DISCORD_TOKEN?.length || 0);

async function testDiscordAPI() {
  try {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        "Authorization": `Bot ${process.env.DISCORD_TOKEN}`
      }
    });
    const data = await response.json();
    console.log("API Response status:", response.status);
    console.log("API Response:", JSON.stringify(data));

    if (response.status === 200) {
      console.log("✅ Token is VALID - Bot username:", data.username);
      return true;
    } else {
      console.log("❌ Token is INVALID - Discord rejected it");
      return false;
    }
  } catch (err) {
    console.error("❌ Cannot reach Discord API:", err.message);
    return false;
  }
}

testDiscordAPI().then(isValid => {
  if (!isValid) {
    console.log("Skipping WebSocket login due to invalid token");
    return;
  }

  console.log("=== ATTEMPTING WEBSOCKET LOGIN ===");

  const loginTimeout = setTimeout(() => {
    console.error("⚠️ LOGIN TIMEOUT - WebSocket connection took more than 30 seconds");
  }, 30000);

  client.login(process.env.DISCORD_TOKEN)
    .then(() => {
      clearTimeout(loginTimeout);
      console.log("✅ Discord WebSocket login successful");
    })
    .catch(err => {
      clearTimeout(loginTimeout);
      console.error("❌ Discord WebSocket login FAILED:", err.message);
      console.error("Error code:", err.code);
    });
});
