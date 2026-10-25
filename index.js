'use strict';

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

const { MENU_IMAGE_URL } = require('./lib/menu');
const { classifyIntent, parseOrder, formatItemList } = require('./lib/order');

const OWNER_JID = process.env.OWNER_JID || '';
const AUTH_DIR = 'auth_info';

const conversationHistory = new Map(); // jid -> recent messages
const orderHistory = new Map(); // jid -> placed orders

const MAX_HISTORY = 20;

function rememberOrder(jid, order) {
  if (!orderHistory.has(jid)) orderHistory.set(jid, []);
  orderHistory.get(jid).push(order);
}

function lastOrder(jid) {
  const orders = orderHistory.get(jid) || [];
  return orders.length ? orders[orders.length - 1] : null;
}

async function sendMenu(sock, jid, caption) {
  await sock.sendMessage(jid, { image: { url: MENU_IMAGE_URL }, caption: caption });
}

async function notifyOwner(sock, text) {
  if (!OWNER_JID) {
    console.warn('OWNER_JID is not set; skipping owner notification.');
    return;
  }
  try {
    await sock.sendMessage(OWNER_JID, { text: text });
  } catch (err) {
    console.error('Could not notify owner:', err.message);
  }
}

async function askModel(history) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.GROQ_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly, sales-focused restaurant assistant. Speak only in English. ' +
            'Keep replies short and end with a question that moves the order forward. ' +
            'Address the customer as Sir or Miss.',
        },
      ].concat(history),
      temperature: 0.8,
      max_tokens: 100,
    }),
  });

  if (!res.ok) throw new Error('model request failed with status ' + res.status);
  const data = await res.json();
  return (
    (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content.trim()
      : '') || 'Welcome Sir! What would you like to order today?'
  );
}

async function handleMessage(sock, jid, text) {
  const intent = classifyIntent(text);

  if (intent === 'menu') {
    await sendMenu(sock, jid, 'Here is our menu. What would you like to order?');
    return;
  }

  if (intent === 'order') {
    const parsed = parseOrder(text);
    if (!parsed.matched) {
      await sock.sendMessage(jid, {
        text: "Sorry Sir, we don't have those items. Please check the menu and order from it.",
      });
      await sendMenu(sock, jid, 'Here is our menu again.');
      return;
    }

    const summary = formatItemList(parsed.items);
    rememberOrder(jid, { items: parsed.items, total: parsed.total, details: text, status: 'confirmed' });

    await sock.sendMessage(jid, {
      text:
        'Order confirmed for: ' + summary + ' (Total: Rs ' + parsed.total + '). ' +
        'Delivery in 30 minutes. Where should we deliver, Sir?',
    });
    await notifyOwner(
      sock,
      'New order\nFrom: ' + jid.split('@')[0] + '\nItems: ' + summary +
        '\nTotal: Rs ' + parsed.total + '\nMessage: ' + text,
    );
    return;
  }

  if (intent === 'cancel') {
    const order = lastOrder(jid);
    if (!order) {
      await sock.sendMessage(jid, { text: 'No recent order to cancel, Sir. Would you like to place one?' });
      return;
    }
    order.status = 'cancelled';
    await sock.sendMessage(jid, { text: 'Your order has been cancelled. Anything else, Sir?' });
    await notifyOwner(sock, 'Order cancelled\nFrom: ' + jid.split('@')[0] + '\nDetails: ' + order.details);
    return;
  }

  if (intent === 'change') {
    const order = lastOrder(jid);
    if (!order) {
      await sock.sendMessage(jid, { text: 'No recent order to change, Sir. Would you like to place one?' });
      return;
    }
    await sock.sendMessage(jid, {
      text:
        'Your last order was: ' + formatItemList(order.items) + ' (Total: Rs ' + order.total + '). ' +
        'What would you like instead, Sir?',
    });
    return;
  }

  if (intent === 'status') {
    const order = lastOrder(jid);
    if (!order) {
      await sock.sendMessage(jid, { text: 'No recent order found, Sir. Would you like to place one?' });
      return;
    }
    const text2 =
      order.status === 'cancelled'
        ? 'Your last order was cancelled. Would you like to place a new one?'
        : 'Your order is ' + order.status + '. Expected delivery in 20-30 minutes. Anything else?';
    await sock.sendMessage(jid, { text: text2 });
    return;
  }

  // Anything else goes to the language model, with a short rolling history.
  if (!conversationHistory.has(jid)) conversationHistory.set(jid, []);
  const history = conversationHistory.get(jid);
  history.push({ role: 'user', content: text });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

  try {
    const reply = await askModel(history);
    history.push({ role: 'assistant', content: reply });
    await sock.sendMessage(jid, { text: reply });
  } catch (err) {
    console.error('Model call failed:', err.message);
    await sock.sendMessage(jid, { text: 'Sorry Sir, the assistant is temporarily unavailable.' });
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }) });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', function (update) {
    const connection = update.connection;
    const lastDisconnect = update.lastDisconnect;
    const qr = update.qr;

    if (qr) {
      console.log('Scan this QR code with WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output
        ? lastDisconnect.error.output.statusCode
        : undefined;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('Connection lost (reconnecting: ' + shouldReconnect + ')');
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('Connected to WhatsApp.');
    }
  });

  sock.ev.on('messages.upsert', async function (event) {
    const msg = event.messages && event.messages[0];
    if (!msg || !msg.message || msg.key.fromMe) return;

    const m = msg.message;
    if (m.audioMessage || m.videoMessage || m.call || m.stickerMessage || m.imageMessage) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: 'Sorry Sir, I can only read text messages. Please type your order, or say "menu".',
      });
      return;
    }

    const text = m.conversation || (m.extendedTextMessage && m.extendedTextMessage.text) || '';
    if (!text.trim()) return;

    try {
      await handleMessage(sock, msg.key.remoteJid, text);
    } catch (err) {
      console.error('Failed to handle message:', err.message);
    }
  });
}

if (require.main === module) {
  startBot();
}

module.exports = { handleMessage, startBot };
