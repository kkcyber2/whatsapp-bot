const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

let conversationHistory = {};
const OWNER_JID = '923243249669@s.whatsapp.net'; // Owner number

// Menu Items with variations for fuzzy match
const menuItems = {
  'beef steak': { price: 'Rs 1200', variations: ['beef steak', 'steak', 'beefsteak'] },
  'beef burger': { price: 'Rs 800', variations: ['beef burger', 'burger', 'beefburger'] },
  'beef karahi': { price: 'Rs 1500', variations: ['beef karahi', 'karahi', 'beef karhai'] },
  'beef handi': { price: 'Rs 1400', variations: ['beef handi', 'handi', 'beef handi'] },
  'beef nihari': { price: 'Rs 1300', variations: ['beef nihari', 'nihari', 'beef nihari'] },
  'fries': { price: 'Rs 250', variations: ['fries', 'french fries', 'chips'] },
  'salad': { price: 'Rs 200', variations: ['salad', 'fresh salad'] },
  'soft drinks': { price: 'Rs 100', variations: ['soft drink', 'coke', 'pepsi', 'sprite'] },
  'lassi': { price: 'Rs 150', variations: ['lassi', 'sweet lassi'] },
  // Add more if needed
};

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

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    // Handle voice / call / non-text
    if (msg.message.audioMessage || msg.message.videoMessage || msg.message.call || msg.message.stickerMessage) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Sorry Sir, I can only process text messages right now. Please type your order or say "menu". 😊' });
      return;
    }

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const jid = msg.key.remoteJid;

    console.log('Received:', text);

    if (text.trim() === '') return;

    // First message → welcome + auto menu
    if (!conversationHistory[jid]) {
      conversationHistory[jid] = [];
      await sock.sendMessage(jid, { 
        image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
        caption: 'Welcome to our restaurant! 😊 Here is our menu. What would you like to order today?'
      });
      conversationHistory[jid].push({ role: 'assistant', content: 'Welcome + menu sent' });
      return;
    }

    // Menu request
    if (text.toLowerCase().includes('menu') || text.toLowerCase().includes('show menu')) {
      await sock.sendMessage(jid, { 
        image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
        caption: 'Here is our menu again, Sir! What would you like to order?'
      });
      return;
    }

    // Order handling with better fuzzy match
    if (text.toLowerCase().includes('order') || text.toLowerCase().includes('want') || text.toLowerCase().includes('need') || text.toLowerCase().includes('give me') || text.toLowerCase().includes('i want')) {
      const lowerText = text.toLowerCase();
      let orderedItem = null;
      let price = '';
      for (const item in menuItems) {
        const variations = menuItems[item].variations;
        for (const varItem of variations) {
          if (lowerText.includes(varItem)) {
            orderedItem = item;
            price = menuItems[item].price;
            break;
          }
        }
        if (orderedItem) break;
      }

      if (orderedItem) {
        const customerNumber = jid.split('@')[0];
        const orderMessage = `New Order Received!\nFrom: ${customerNumber}\nItem: ${orderedItem.charAt(0).toUpperCase() + orderedItem.slice(1)}\nPrice: ${price}\nFull Message: ${text}\nTime: ${new Date().toLocaleString('en-PK')}\nPlease process immediately.`;

        // Customer ko confirm + ask location
        await sock.sendMessage(jid, { text: `Order confirmed for ${orderedItem.charAt(0).toUpperCase() + orderedItem.slice(1)} (${price})! Delivery in 30 minutes. Where should we deliver, Sir? (full address)` });

        // Owner ko notify
        await sock.sendMessage(OWNER_JID, { text: orderMessage });
      } else {
        // Not in menu
        await sock.sendMessage(jid, { text: 'Sorry Sir, we don\'t have that item. Please check the menu and order something from it. 😊' });
        await sock.sendMessage(jid, { 
          image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
          caption: 'Here is our menu again. What would you like to order?'
        });
      }
      return;
    }

    // Normal friendly sales conversation (no Urdu replies)
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
              content: 'You are a friendly, helpful and sales-focused restaurant assistant. Speak ONLY in English. Be warm and welcoming. Always push for orders politely. If customer asks for menu, send it. If they order something not in menu, politely say sorry and send menu again. Keep replies short, positive, and end with a question to continue order. Address as Sir/Miss. Never mention Konain/KK. Example: "Welcome Sir! What would you like to order today? 😊"'
            },
            ...conversationHistory[jid]
          ],
          temperature: 0.8,
          max_tokens: 100
        })
      });

      console.log('Groq HTTP status:', groqRes.status);

      if (!groqRes.ok) {
        throw new Error(`Groq error! Status: ${groqRes.status}`);
      }

      const data = await groqRes.json();
      const reply = data.choices[0]?.message?.content?.trim() || 'Welcome Sir! What would you like to order today? 😊';

      conversationHistory[jid].push({ role: 'assistant', content: reply });

      await sock.sendMessage(jid, { text: reply });
    } catch (err) {
      console.error('Groq fetch failed:', err.message);
      await sock.sendMessage(jid, { text: 'Sorry, assistant temporarily unavailable.' });
    }
  });
}

startBot();
