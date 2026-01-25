const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

let conversationHistory = {};
let orderHistory = {}; // Per user order memory
const OWNER_JID = '923243249669@s.whatsapp.net'; // Owner number

// Full Menu Items
const menuItems = {
  'beef steak': { price: 'Rs 1200', variations: ['beef steak', 'steak', 'beefsteak'] },
  'beef burger': { price: 'Rs 800', variations: ['beef burger', 'burger', 'beefburger'] },
  'beef karahi': { price: 'Rs 1500', variations: ['beef karahi', 'karahi', 'beef karhai'] },
  'beef handi': { price: 'Rs 1400', variations: ['beef handi', 'handi', 'beef handi'] },
  'beef nihari': { price: 'Rs 1300', variations: ['beef nihari', 'nihari', 'beef nihari'] },
  'fries': { price: 'Rs 250', variations: ['fries', 'french fries', 'chips'] },
  'salad': { price: 'Rs 200', variations: ['salad', 'fresh salad'] },
  'soft drinks': { price: 'Rs 100', variations: ['soft drink', 'coke', 'pepsi', 'sprite', 'drink'] },
  'lassi': { price: 'Rs 150', variations: ['lassi', 'sweet lassi'] },
  'chocolate brownie': { price: 'Rs 400', variations: ['chocolate brownie', 'brownie', 'browni'] }
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

    // Handle non-text
    if (msg.message.audioMessage || msg.message.videoMessage || msg.message.call || msg.message.stickerMessage) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Sorry Sir, I can only process text messages right now. Please type your order or say "menu". 😊' });
      return;
    }

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const jid = msg.key.remoteJid;

    console.log('Received:', text);

    if (text.trim() === '') return;

    // Welcome + menu
    if (!conversationHistory[jid]) {
      conversationHistory[jid] = [];
      orderHistory[jid] = [];
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

    // Order handling (multiple items)
    if (text.toLowerCase().includes('order') || text.toLowerCase().includes('want') || text.toLowerCase().includes('need') || text.toLowerCase().includes('give me') || text.toLowerCase().includes('i want')) {
      const lowerText = text.toLowerCase();
      const orderedItems = [];
      let totalPrice = 0;

      // Split by 'and', 'with', ',', 'or'
      const parts = lowerText.split(/\s+(?:and|with|or|,)\s+/).map(p => p.trim());

      for (const part of parts) {
        for (const item in menuItems) {
          const variations = menuItems[item].variations;
          for (const varItem of variations) {
            if (part.includes(varItem)) {
              orderedItems.push(item);
              totalPrice += parseInt(menuItems[item].price.replace('Rs ', ''));
              break;
            }
          }
        }
      }

      if (orderedItems.length > 0) {
        orderHistory[jid].push({ items: orderedItems, total: totalPrice, details: text, status: 'confirmed', time: new Date().toLocaleString('en-PK') });

        const customerNumber = jid.split('@')[0];
        const itemList = orderedItems.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');
        const orderMessage = `New Order Received!\nFrom: ${customerNumber}\nItems: ${itemList}\nTotal: Rs ${totalPrice}\nFull Message: ${text}\nTime: ${new Date().toLocaleString('en-PK')}\nPlease process immediately.`;

        await sock.sendMessage(jid, { text: `Order confirmed for: ${itemList} (Total: Rs ${totalPrice})! Delivery in 30 minutes. Where should we deliver, Sir? (full address)` });

        await sock.sendMessage(OWNER_JID, { text: orderMessage });
      } else {
        await sock.sendMessage(jid, { text: 'Sorry Sir, we don\'t have those items. Please check the menu and order something from it. 😊' });
        await sock.sendMessage(jid, { 
          image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
          caption: 'Here is our menu again. What would you like to order?'
        });
      }
      return;
    }

    // Location reply (final confirm)
    if (orderHistory[jid] && orderHistory[jid].length > 0) {
      const lastOrder = orderHistory[jid][orderHistory[jid].length - 1];
      if (lastOrder.status === 'confirmed' && text.length > 5) { // Assume address is longer
        lastOrder.location = text;
        lastOrder.status = 'on way';

        const itemList = lastOrder.items.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');
        await sock.sendMessage(jid, { text: `Thank you Sir! Your order (${itemList} - Rs ${lastOrder.total}) is on the way to: ${text}. Expected in 30 minutes. Order ID: #${Math.floor(Math.random() * 10000) + 1000}. Anything else? 😊` });

        await sock.sendMessage(OWNER_JID, { text: `Order Finalized!\nFrom: ${jid.split('@')[0]}\nItems: ${itemList}\nTotal: Rs ${lastOrder.total}\nAddress: ${text}\nTime: ${new Date().toLocaleString('en-PK')}` });
      }
      return;
    }

    // Cancel order
    if (text.toLowerCase().includes('cancel order') || text.toLowerCase().includes('order cancel')) {
      if (orderHistory[jid] && orderHistory[jid].length > 0) {
        const lastOrder = orderHistory[jid][orderHistory[jid].length - 1];
        lastOrder.status = 'cancelled';

        await sock.sendMessage(jid, { text: 'Your last order has been cancelled. Sorry for any inconvenience. What else can I help with? 😊' });

        await sock.sendMessage(OWNER_JID, { text: 'Order Cancelled!\nFrom: ' + jid.split('@')[0] + '\nDetails: ' + lastOrder.details });
      } else {
        await sock.sendMessage(jid, { text: 'No recent order to cancel, Sir. Would you like to place one? 😊' });
      }
      return;
    }

    // Order status
    if (text.toLowerCase().includes('order status') || text.toLowerCase().includes('when will order arrive')) {
      if (orderHistory[jid] && orderHistory[jid].length > 0) {
        const lastOrder = orderHistory[jid][orderHistory[jid].length - 1];
        let statusReply = `Your order is ${lastOrder.status}. Expected delivery in 20-30 minutes. Anything else? 😊`;

        if (lastOrder.status === 'cancelled') {
          statusReply = 'Your last order was cancelled. Would you like to place a new one? 😊';
        }

        await sock.sendMessage(jid, { text: statusReply });
      } else {
        await sock.sendMessage(jid, { text: 'No recent order found, Sir. Would you like to place one? 😊' });
      }
      return;
    }

    // Normal conversation
    if (!conversationHistory[jid]) conversationHistory[jid] = [];
    conversationHistory[jid].push({ role: 'user', content: text });
    if (conversationHistory[jid].length > 20) conversationHistory[jid] = conversationHistory[jid].slice(-20);

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
