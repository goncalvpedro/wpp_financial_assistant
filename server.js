const express = require('express');
const { initDB } = require('./src/db');
const webhookRoutes = require('./src/api/webhook');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/webhook', webhookRoutes);

// Logg for debugging
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`, req.body);
  next();
});

app.get('/', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });