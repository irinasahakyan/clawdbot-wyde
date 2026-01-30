# DeFi Monitor Skill

## Purpose
Monitor crypto markets, liquidity pools, and send alerts.

## What This Skill Does
- Track liquidity pool APYs
- Monitor whale movements (big transactions)
- Alert on price changes
- Track TVL (Total Value Locked)

## Commands Users Can Say

- "Show best yields"
- "What's the APY on ETH/USDC pool?"
- "Any whale activity?"
- "Set alert when ETH hits $4000"
- "Show pool stats"

## Alert Types

**Price Alerts:**
- "Alert me when BTC hits 100k"
- "Tell me if ETH drops below 3000"

**Whale Alerts (automatic):**
- Transactions over $100k get flagged
- Posted to Discord automatically

**Yield Alerts:**
- When APY changes significantly
- New high-yield opportunities

## Example Alert

```
🐋 Whale Alert!

Someone just moved:
💰 500,000 USDC → ETH

On: Uniswap v3
Time: Just now
Tx: 0x7f3d...

This could mean price movement incoming!
```
