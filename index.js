const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

let conversationHistory = {};
const OWNER_JID = '923243249669@s.whatsapp.net'; // Owner number

// Menu Items Array (image ke hisaab se - names lowercase mein for easy check, prices add kiye)
const menuItems = {
  'beef steak': { price: 'Rs 1200', description: 'Grilled beef steak with sides' },
  'beef burger': { price: 'Rs 800', description: 'Juicy beef burger' },
  'beef karahi': { price: 'Rs 1500', description: 'Traditional beef karahi' },
  'beef handi': { price: 'Rs 1400', description: 'Creamy beef handi' },
  'beef nihari': { price: 'Rs 1300', description: 'Special beef nihari' },
  'onion rings': { price: 'Rs 300', description: 'Crispy onion rings' },
  'garlic bread': { price: 'Rs 350', description: 'Fresh garlic bread' },
  'fries': { price: 'Rs 250', description: 'Golden fries' },
  'salad': { price: 'Rs 200', description: 'Fresh salad' },
  'soft drinks': { price: 'Rs 100', description: 'Coke/Pepsi' },
  'lassi': { price: 'Rs 150', description: 'Sweet lassi' }
  // Add more items from menu if needed
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

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const jid = msg.key.remoteJid;

    console.log('Received:', text);

    if (text.trim() === '') return;

    // First message / welcome + auto menu
    if (!conversationHistory[jid]) {
      conversationHistory[jid] = [];
      await sock.sendMessage(jid, { 
        image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
        caption: 'Welcome to our restaurant! 😊\nHere is our menu. What would you like to order today? / خوش آمدید! یہ ہمارا مینو ہے۔ آج کیا آرڈر کریں گے؟'
      });
      conversationHistory[jid].push({ role: 'assistant', content: 'Welcome + menu sent' });
      return;
    }

    // Menu request (English/Urdu)
    if (text.toLowerCase().includes('menu') || text.toLowerCase().includes('منو') || text.toLowerCase().includes('مینو') || text.toLowerCase().includes('show menu')) {
      await sock.sendMessage(jid, { 
        image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
        caption: 'Here is our menu again, Sir! What would you like to order? / مینو دوبارہ یہ رہا۔ کیا آرڈر کریں گے؟'
      });
      return;
    }

    // Order handling (check if item in menu)
    if (text.toLowerCase().includes('order') || text.toLowerCase().includes('آرڈر') || text.toLowerCase().includes('want') || text.toLowerCase().includes('need')) {
      const lowerText = text.toLowerCase();
      let orderedItem = null;
      for (const item in menuItems) {
        if (lowerText.includes(item)) {
          orderedItem = item;
          break;
        }
      }

      if (orderedItem) {
        const itemInfo = menuItems[orderedItem];
        const customerNumber = jid.split('@')[0];
        const orderMessage = `New Order Received!\nFrom: ${customerNumber}\nItem: ${orderedItem.charAt(0).toUpperCase() + orderedItem.slice(1)}\nPrice: ${itemInfo.price}\nDetails: ${text}\nTime: ${new Date().toLocaleString('en-PK')}\nPlease process immediately.`;

        // Customer ko confirm
        await sock.sendMessage(jid, { text: `Order confirmed for ${orderedItem.charAt(0).toUpperCase() + orderedItem.slice(1)} (${itemInfo.price}). Delivery in 30 minutes. Thank you! 😊 / ${itemInfo.price} میں آرڈر کنفرم ہو گیا۔ 30 منٹ میں ڈلیوری۔ شکریہ!` });

        // Owner ko notify
        await sock.sendMessage(OWNER_JID, { text: orderMessage });
      } else {
        // Not in menu
        await sock.sendMessage(jid, { text: 'Sorry Sir, we don\'t have that item right now. Please check the menu and order something from it. 😊 / افسوس، یہ آئٹم دستیاب نہیں۔ مینو دیکھیں اور اس میں سے آرڈر کریں۔' });
        await sock.sendMessage(jid, { 
          image: { url: 'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg' },
          caption: 'Here is our menu again. What would you like? / مینو دوبارہ یہ رہا۔ کیا پسند کریں گے؟'
        });
      }
      return;
    }

    // Normal conversation (friendly sales tone)
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
              content: 'You are a friendly, helpful and sales-focused restaurant assistant. Speak in English or Urdu (mix if needed). Be warm and welcoming. Always push for orders politely. If customer asks for menu, send it. If they order something not in menu, politely say sorry and send menu again. Keep replies short, positive, and end with a question to continue order. Address as Sir/Miss. Never mention Konain/KK. Example: "Welcome Sir! What would you like to order today? 😊" or "یہ مینو ہے، کیا آرڈر کریں گے؟"'
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
