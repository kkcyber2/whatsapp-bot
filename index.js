const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

let conversationHistory = {};
let replyMode = false;
let lastOwnerMessageTime = Date.now();
const OWNER_JID = '923243249669@s.whatsapp.net'; // Owner number (03243249669)
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
        image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
        caption: 'Here is the menu, Sir. Order now.'
      });
      return;
    }

    // Order confirmation + notify owner
    if (text.toLowerCase().includes('order')) {
      const customerNumber = jid.split('@')[0];
      const orderMessage = `New Order Received!\nFrom: ${customerNumber}\nOrder Details: ${text}\nTime: ${new Date().toLocaleString('en-PK')}\nPlease process immediately.`;

      // Customer ko confirm
      await sock.sendMessage(jid, { text: 'Order confirmed. Delivery in 30 minutes. Thank you, Sir.' });

      // Owner ko notify
      await sock.sendMessage(OWNER_JID, { text: orderMessage });

      return;
    }

    // Normal conversation with Groq (cold & strict personality)
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
              content: 'You are Jarvis, a cold, direct, strict, and highly professional assistant. Speak ONLY in English. Keep replies very short, sharp, and to the point — no chit-chat, no extra words, no emojis unless necessary. Address the user as Sir or Miss. If the user asks about Konain/KK or his status, reply only: "Sir is busy right now. If you have work, tell me, or you can wait." For all other messages, be brief and cold. Important tasks: reply "Sir will reply soon." Never be friendly or talkative.'
            },
            ...conversationHistory[jid]
          ],
          temperature: 0.6,
          max_tokens: 100
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
