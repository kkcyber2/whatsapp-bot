const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

let conversationHistory = {};
let replyMode = false;
let lastOwnerMessageTime = Date.now();
const OWNER_JID = '923123583827@s.whatsapp.net';
const SILENT_DURATION = 5 * 60 * 1000; // 5 min

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

    if (jid === OWNER_JID) {
      lastOwnerMessageTime = Date.now();
      replyMode = false;
      console.log('Sir Konain message bheja — bot silent mode ON');
      return;
    }

    if (!replyMode) {
      console.log('Sir Konain active hain — bot silent mode mein');
      return;
    }

    if (!conversationHistory[jid]) conversationHistory[jid] = [];
    conversationHistory[jid].push({ role: 'user', content: text });
    if (conversationHistory[jid].length > 10) conversationHistory[jid] = conversationHistory[jid].slice(-10);

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are Jarvis, a cold, direct and strict assistant. Speak ONLY in English, No Roman Urdu or any other language. Keep replies very short, sharp and to the point. Never reveal or mention the name KK or Konain to anyone. If someone asks about KK/Konain, who he is, where he is or if he is busy, reply only: "Sir is busy right now. If you have work, tell me, or you can wait." For normal messages be cold and brief. Address people as Sir or Miss or use the name they give in the message. Important tasks: reply "Sir will reply soon." No chit-chat, no extra words.'
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
      const reply = data.choices[0]?.message?.content?.trim() || 'Sir Konain jaldi check kar lenge.';

      conversationHistory[jid].push({ role: 'assistant', content: reply });

      await sock.sendMessage(jid, { text: reply });
    } catch (err) {
      console.error('Groq fetch failed:', err.message);
      await sock.sendMessage(jid, { text: 'Sorry, Sir Konain ka assistant thodi der ke liye unavailable hai.' });
    }
  });
}

startBot();
