const express = require('express');
const GPTService = require('./services/gptService');
const { Configuration, OpenAIApi } = require('openai');
const { OPENAI_API_KEY, LLM_MODEL } = require('./config');

const router = express.Router();
const gpt = new GPTService();
const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

// 1. Parse a transaction-like message into structured JSON via GPTService
router.post('/parse-transaction', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing `text` in request body' });

  try {
    const parsed = await gpt.parseTransaction(text);
    res.json({ parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Generic AI chat endpoint using OpenAI client
router.post('/ai-chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: '`messages` must be an array of { role, content }' });
  }

  try {
    const resp = await openai.createChatCompletion({
      model: LLM_MODEL,
      messages,
      temperature: 0.7
    });
    const reply = resp.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Placeholder summary endpoint (future balance or other summaries)
router.post('/summary', (req, res) => {
  res.json({ message: 'Summary feature not implemented yet.' });
});

module.exports = router;
