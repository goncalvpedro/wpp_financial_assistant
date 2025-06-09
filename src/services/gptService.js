const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const parseUserInput = async (message) => {
  const today = new Date().toISOString().split('T')[0];
  const prompt = `You are a financial assistant. Given the user's message, output a JSON with one of two formats. If it's a financial transaction, output:{\"intent\":\"transaction\",\"amount\":number,\"type\":\"income\" or \"expense\",\"category\":string,\"description\":string,\"date\":\"YYYY-MM-DD\"}. If it's a financial query, output:{\"intent\":\"query\",\"metric\":\"expense\", \"income\", or \"balance\",\"dateFrom\":\"YYYY-MM-DD\",\"dateTo\":\"YYYY-MM-DD\"}. Assume today's date is ${today}. Only output the JSON. Message: "${message}"`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { parseUserInput };