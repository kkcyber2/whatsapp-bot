const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

let conversationHistory = {};
let replyMode = false;
let lastOwnerMessageTime = Date.now();
const OWNER_JID = process.env.OWNER_JID || '923123583827@s.whatsapp.net';
const SILENT_DURATION = 5 * 60 * 1000; // 5 minutes

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    logger: require('pino')({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('Scan this QR code with WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection lost', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp!');
    }
  });

  setInterval(() => {
    const now = Date.now();
    if (!replyMode && (now - lastOwnerMessageTime > SILENT_DURATION)) {
      replyMode = true;
      console.log('Sir Konain inactive — Jarvis reply mode ON');
    }
  }, 30000);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const jid = msg.key.remoteJid;

    console.log('Received:', text);

    if (text.trim() === '') return;

    // Owner message → silent mode
    if (jid === OWNER_JID) {
      lastOwnerMessageTime = Date.now();
      replyMode = false;
      console.log('Sir Konain message bheja — bot silent mode ON');
      return;
    }

    // Non-owner, but Sir Konain active → silent
    if (!replyMode) {
      console.log('Sir Konain active hain — bot silent mode mein');
      return;
    }

    // Menu trigger (English + Urdu)
    if (text.toLowerCase().includes('menu') || text.toLowerCase().includes('منو') || text.toLowerCase().includes('مینو')) {
      await sock.sendMessage(jid, { 
        image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },  // ← Yeh naya link daal diya
        caption: 'Here is the menu, Sir.'
      });
      return;
    }

    // Order confirmation
    if (text.toLowerCase().includes('order')) {
      await sock.sendMessage(jid, { text: 'Order confirmed. Delivery in 30 minutes. Thank you, Sir.' });
      return;
    }

    // Conversation history for Groq
    if (!conversationHistory[jid]) conversationHistory[jid] = [];
    conversationHistory[jid].push({ role: 'user', content: text });
    if (conversationHistory[jid].length > 10) conversationHistory[jid] = conversationHistory[jid].slice(-10);

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are Jarvis, a cold, direct and strict assistant. Speak ONLY in English, no Roman Urdu or any other language. Keep replies very short, sharp and to the point. Never reveal or mention the name KK or Konain to anyone. If someone asks about KK/Konain, who he is, where he is or if he is busy, reply only: "Sir is busy right now. If you have work, tell me, or you can wait." For normal messages be cold and brief. Address people as Sir or Miss or use the name they give in the message. Important tasks: reply "Sir will reply soon." No chit-chat, no extra words.'
            },
            ...conversationHistory[jid]
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      console.log('Groq HTTP status:', groqRes.status);

      if (!groqRes.ok) {
        throw new Error(`Groq error! Status: ${groqRes.status}`);
      }

      const data = await groqRes.json();
      const reply = data.choices[0]?.message?.content?.trim() || 'Sir will reply soon.';

      conversationHistory[jid].push({ role: 'assistant', content: reply });

      await sock.sendMessage(jid, { text: reply });
    } catch (err) {
      console.error('Groq fetch failed:', err.message);
      await sock.sendMessage(jid, { text: 'Sorry, assistant temporarily unavailable.' });
    }
  });
}

startBot();
