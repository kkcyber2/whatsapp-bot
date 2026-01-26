const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

let conversationHistory = {};
let pendingOrders = {};
let messageTimestamps = {};
const OWNER_JID = process.env.OWNER_JID || '923243249669@s.whatsapp.net';
const MAX_MESSAGES_PER_MIN = 5;
const HISTORY_LIMIT = 15;

const menuItems = {
  'beef steak': { price: 'Rs 1200', variations: ['beef steak', 'steak', 'beefsteak'] },
  'beef burger': { price: 'Rs 800', variations: ['beef burger', 'burger', 'beefburger'] },
  'beef karahi': { price: 'Rs 1500', variations: ['beef karahi', 'karahi', 'beef karhai'] },
  'beef handi': { price: 'Rs 1400', variations: ['beef handi', 'handi', 'beef handi'] },
  'beef nihari': { price: 'Rs 1300', variations: ['beef nihari', 'nihari', 'beef nihari'] },
  'fries': { price: 'Rs 250', variations: ['fries', 'french fries', 'chips'] },
  'salad': { price: 'Rs 200', variations: ['salad', 'fresh salad'] },
  'soft drinks': { price: 'Rs 100', variations: ['soft drink', 'coke', 'pepsi', 'sprite', 'drink'] },
  'lassi': { price: 'Rs 150', variations: ['lassi', 'sweet lassi'] }
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    logger: require('pino')({ level: 'silent' }),
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('New QR generated - scan via Linked Devices');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection lost. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    if (msg.message.audioMessage || msg.message.videoMessage || msg.message.call || msg.message.stickerMessage) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Sorry Sir, I can only process text messages. Please type your order or say "menu". 😊' });
      return;
    }

    let text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    text = text.replace(/[<>{}();]/g, ''); // Sanitize
    const jid = msg.key.remoteJid;

    console.log('Received from', jid.split('@')[0], ':', text);

    if (text.trim() === '') return;

    // Rate limiting
    if (!messageTimestamps[jid]) messageTimestamps[jid] = [];
    const now = Date.now();
    messageTimestamps[jid] = messageTimestamps[jid].filter(ts => now - ts < 60000);
    if (messageTimestamps[jid].length >= MAX_MESSAGES_PER_MIN) {
      await sock.sendMessage(jid, { text: 'Please slow down, Sir. One message at a time. 😊' });
      return;
    }
    messageTimestamps[jid].push(now);

    // Welcome + menu
    if (!conversationHistory[jid]) {
      conversationHistory[jid] = [];
      await sock.sendMessage(jid, { 
        image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
        caption: 'Welcome to our restaurant! 😊 Here is our menu. What would you like to order today?'
      });
      conversationHistory[jid].push({ role: 'assistant', content: 'Welcome + menu sent', time: now });
      return;
    }

    // Menu request
    if (text.toLowerCase().includes('menu') || text.toLowerCase().includes('show menu')) {
      await sock.sendMessage(jid, { 
        image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
        caption: 'Here is our menu, Sir! What would you like to order?'
      });
      return;
    }

    // Complaint / Wrong Order
    if (text.toLowerCase().includes('wrong order') || text.toLowerCase().includes('order galat') || text.toLowerCase().includes('complaint') || text.toLowerCase().includes('issue') || text.toLowerCase().includes('refund') || text.toLowerCase().includes('problem')) {
      const customerNumber = jid.split('@')[0];
      const complaintDetails = text;

      const urgentMessage = `URGENT COMPLAINT!\nFrom: ${customerNumber}\nDetails: ${complaintDetails}\nTime: ${new Date().toLocaleString('en-PK')}\nPlease check immediately!`;

      await sock.sendMessage(jid, { text: 'Sorry for the inconvenience, Sir 😔. Please tell me exactly what went wrong, and I have informed the owner right away. We will fix it quickly.' });

      await sock.sendMessage(OWNER_JID, { text: urgentMessage });

      await sock.sendMessage(jid, { text: 'Can you send more details or a photo? Thank you for your patience.' });

      return;
    }

    // Order handling (multiple items)
    if (text.toLowerCase().includes('order') || text.toLowerCase().includes('want') || text.toLowerCase().includes('need')) {
      const lowerText = text.toLowerCase();
      const orderedItems = [];
      let totalPrice = 0;

      const possibleItems = lowerText.split(/\s+(?:and|with|or|,)\s+|\s+/).filter(word => word.trim());

      for (const word of possibleItems) {
        for (const item in menuItems) {
          const variations = menuItems[item].variations;
          for (const varItem of variations) {
            if (word.includes(varItem)) {
              orderedItems.push(item);
              totalPrice += parseInt(menuItems[item].price.replace('Rs ', ''));
              break;
            }
          }
        }
      }

      if (orderedItems.length > 0) {
        pendingOrders[jid] = { items: orderedItems, total: totalPrice, details: text };

        const customerNumber = jid.split('@')[0];
        const itemList = orderedItems.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');
        const orderMessage = `New Order!\nFrom: ${customerNumber}\nItems: ${itemList}\nTotal: Rs ${totalPrice}\nDetails: ${text}\nTime: ${new Date().toLocaleString('en-PK')}`;

        await sock.sendMessage(jid, { text: `Order confirmed for ${itemList} (Rs ${totalPrice})! Delivery in 30 min. Where to deliver, Sir? (full address)` });

        await sock.sendMessage(OWNER_JID, { text: orderMessage });
      } else {
        await sock.sendMessage(jid, { text: 'Sorry Sir, we don\'t have that. Please check the menu. 😊' });
        await sock.sendMessage(jid, { 
          image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
          caption: 'Here is our menu. What would you like?'
        });
      }
      return;
    }

    // Location reply (final confirm)
    if (pendingOrders[jid]) {
      const order = pendingOrders[jid];
      const customerNumber = jid.split('@')[0];
      const location = text;

      const itemList = order.items.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');
      const finalOrderMessage = `Order Finalized!\nFrom: ${customerNumber}\nItems: ${itemList}\nTotal: Rs ${order.total}\nAddress: ${location}\nTime: ${new Date().toLocaleString('en-PK')}`;

      await sock.sendMessage(jid, { text: `Thank you Sir! Order (${itemList} - Rs ${order.total}) on the way to ${location}. Expected in 30 min. Anything else? 😊` });

      await sock.sendMessage(OWNER_JID, { text: finalOrderMessage });

      delete pendingOrders[jid];
      return;
    }

    // Normal conversation (short replies)
    if (!conversationHistory[jid]) conversationHistory[jid] = [];
    conversationHistory[jid].push({ role: 'user', content: text, time: Date.now() });
    if (conversationHistory[jid].length > HISTORY_LIMIT) conversationHistory[jid] = conversationHistory[jid].slice(-HISTORY_LIMIT);

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
              content: 'You are a friendly, helpful restaurant assistant. Speak ONLY in English. Be warm and welcoming. Keep replies very short (1-2 sentences max). Always push for orders politely. End with a question. Address as Sir/Miss. Example: "Welcome Sir! What would you like to order? 😊"'
            },
            ...conversationHistory[jid].map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.6,
          max_tokens: 80
        })
      });

      console.log('Groq HTTP status:', groqRes.status);

      if (!groqRes.ok) {
        throw new Error(`Groq error! Status: ${groqRes.status}`);
      }

      const data = await groqRes.json();
      const reply = data.choices[0]?.message?.content?.trim() || 'Welcome Sir! What would you like to order? 😊';

      conversationHistory[jid].push({ role: 'assistant', content: reply, time: Date.now() });

      await sock.sendMessage(jid, { text: reply });
    } catch (err) {
      console.error('Groq fetch failed:', err.message);
      await sock.sendMessage(jid, { text: 'Sorry, assistant temporarily unavailable. Please try again later.' });
    }
  });
}

startBot();
