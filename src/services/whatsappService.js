const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const prisma = require('../db');
const GPTService = require('./gptService');

class WhatsAppService {
  constructor() {
    this.gpt = new GPTService();
    this.ALLOWED_CHAT = '5515997178822@c.us';
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true }
    });

    this.client.on('qr', qr => qrcode.generate(qr, { small: true }));
    this.client.on('ready', () => console.log('WhatsApp client ready'));
    this.client.on('message', this.handleMessage.bind(this));
  }

  async handleMessage(msg) {
    try {
      if (msg.from !== this.ALLOWED_CHAT) {
        console.log(`Ignored message from ${msg.from}`);
        return;
      }
      if (msg.type !== 'chat') {
        return msg.reply('Sorry, only text messages are supported right now.');
      }

      const waId = msg.from;
      let user = await prisma.users.findUnique({ where: { phone: waId } });
      if (!user) {
        user = await prisma.users.create({ data: { phone: waId } });
      }

      const text = msg.body.trim();
      const msgType = await this.gpt.classifyMessage(text);
      if (msgType === 'balance_query') {
        return msg.reply('Balance query received! This feature is coming soon.');
      }
      if (msgType === 'transaction') {
        const parsed = await this.gpt.parseTransaction(text);
        let category = await prisma.category.findFirst({ where: { name: parsed.category, user_id: user.id } });
        if (!category) {
          category = await prisma.category.findFirst({ where: { name: parsed.category, user_id: null } });
        }
        if (!category) {
          category = await prisma.category.create({ data: { name: parsed.category, user_id: user.id } });
        }
        await prisma.transaction.create({ data: {
          user_id:     user.id,
          amount:      parsed.amount,
          currency:    parsed.currency,
          date:        new Date(parsed.date),
          category_id: category.id,
          note:        parsed.note,
          raw_text:    text
        }});
        return msg.reply(`Got it! Recorded ${parsed.amount} ${parsed.currency} on ${parsed.date} under ${category.name}.`);
      }

      return msg.reply('Sorry, I did not understand that. Send a transaction or ask for your balance.');
    } catch (e) {
      console.error('Message handler error:', e);
      msg.reply('Oops, something went wrong.');
    }
  }

  initialize() {
    this.client.initialize();
  }
}

module.exports = WhatsAppService;
