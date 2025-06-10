// index.js (CommonJS)
const express = require('express');
const WhatsAppService = require('./src/services/whatsappService');
const { PORT } = require('./src/config');

const app = express();
app.use(express.json());
app.use('/api', require('./src/routes'));

const waService = new WhatsAppService();
waService.initialize();

app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
