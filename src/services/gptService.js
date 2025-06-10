const { Configuration, OpenAIApi } = require('openai');
const { OPENAI_API_KEY, LLM_MODEL } = require('../config');

class GPTService {
  constructor() {
    const cfg = new Configuration({ apiKey: OPENAI_API_KEY });
    this.client = new OpenAIApi(cfg);
    this.model = LLM_MODEL;
  }

  // Extract structured transaction data
  async parseTransaction(text) {
    const prompt = `
You are a financial assistant. Extract from the user's message the following JSON:
{
  amount: number,
  currency: string,
  date: string (YYYY-MM-DD),
  note: string,
  category: string
}
User message: "${text}"
Respond with JSON only.`;

    const res = await this.client.createChatCompletion({
      model: this.model,
      messages: [
        { role: 'system', content: 'You extract financial transactions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0
    });

    return JSON.parse(res.data.choices[0].message.content);
  }

  // Classify user message as 'transaction' or 'balance_query'
  async classifyMessage(text) {
    const prompt = `
Classify the following message as either a "transaction" or "balance_query". Respond with exactly one word:

Message: "${text}"
`;
    const res = await this.client.createChatCompletion({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    });
    return res.data.choices[0].message.content.trim().toLowerCase();
  }
}

module.exports = GPTService;
