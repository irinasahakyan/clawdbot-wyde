# WYDE Trading Skill

## Purpose
Execute crypto trades on WYDE Impact Exchange. Every trade allocates fees to charitable causes.

## What This Skill Does
- Get real-time token prices
- Execute token swaps with best routing
- Calculate impact fees going to charity
- Track trade history

## Commands Users Can Say

**Price Check:**
- "What's the price of ETH?"
- "Show me BTC price"
- "Price check USDC"

**Swapping:**
- "Swap 0.1 ETH for USDC"
- "Trade 100 USDC for ETH"
- "Get a quote for swapping 50 USDC to WYDE"

**Impact:**
- "How much went to charity from my last trade?"
- "Show my impact stats"

## Safety Rules
- Always confirm trades over $100 before executing
- Show the user exactly what they'll receive
- Display gas fees clearly
- Show which charity receives the impact fee

## Example Response Format

When user asks for a swap:
```
🔄 Swap Quote

You send: 0.1 ETH ($325.00)
You receive: ~324.50 USDC

Fees:
├─ Network gas: ~$0.15
├─ DEX fee: $0.32
└─ 🌍 Impact fee: $0.03 → Environmental causes

Ready to swap? Reply YES to confirm.
```
