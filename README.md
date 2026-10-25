# WhatsApp Restaurant Ordering Bot

A WhatsApp bot for a small restaurant: it shows the menu, parses what the
customer typed into real order items, tracks the order so it can be changed,
cancelled or queried, and falls back to a language model for anything that is
not an order.

## What it does

- Sends the menu on request ("menu", "what do you have", "prices").
- Turns free text into line items — "one lassi and a beef burger" becomes two
  items and a correct total. Misspellings in the catalogue are matched too.
- Remembers the last order per customer, so "cancel order", "change order" and
  "where is my order" act on the right thing.
- Notifies the owner on every new or cancelled order.
- Answers everything else with a short, sales-oriented reply from an LLM.

Intent detection is checked before order parsing. That ordering matters: with
the checks the other way round, "cancel order" was read as a fresh order and
the cancellation silently never happened.

## Requirements

- Node.js 18 or newer (uses the built-in `fetch`)
- A WhatsApp account to link as the bot
- Optional: a Groq API key, only for the conversational fallback

## Setup

```bash
git clone https://github.com/kkcyber2/whatsapp-bot.git
cd whatsapp-bot
npm install
cp .env.example .env    # then fill in the values
npm start
```

A QR code appears in the terminal. Scan it with WhatsApp
(Settings -> Linked devices -> Link a device). The session is written to
`auth_info/`, which is git-ignored — never commit it, it holds the account's
private keys.

### Configuration

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | No | Powers replies for non-order messages. Without it, the bot still handles menu, orders, cancel, change and status. |
| `OWNER_JID` | No | Where order notifications go, e.g. `923001234567@s.whatsapp.net`. Without it, notifications are skipped and logged. |

## Tests

```bash
npm test
```

16 tests covering intent classification, menu matching (word boundaries,
longest-variation preference, casing and spacing), total calculation, unknown
items, and the self-consistency of the catalogue. They need no network and no
WhatsApp account.

## Project layout

```
index.js        WhatsApp wiring and message routing
lib/menu.js     The catalogue: prices and accepted spellings
lib/order.js    Intent detection, item matching, totals
test/           Behavioural tests
```

`lib/` has no dependency on WhatsApp, which is why the logic is testable
without a connection.

## Editing the menu

Add an entry to `MENU` in `lib/menu.js`:

```js
'chicken tikka': {
  price: 900,
  variations: ['chicken tikka', 'tikka', 'chiken tikka'],
},
```

The key is the canonical name used in order summaries; `variations` are the
spellings and shorthand customers actually type. Keep variations unique across
items — a test enforces this, because an ambiguous variation makes matching
silently pick the wrong dish.

## Licence

MIT — see `LICENSE`. Author: Konain Sultan Khan (KK),
https://github.com/kkcyber2
