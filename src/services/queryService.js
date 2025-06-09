const { prisma } = require('../db');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const handleQuery = async (phone, queryData) => {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return 'Você ainda não tem transações registradas.';

  const { dateFrom, dateTo, metric } = queryData;
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: new Date(dateFrom), lte: new Date(dateTo) },
    },
  });

  let total = 0;
  if (metric === 'expense') {
    total = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  } else if (metric === 'income') {
    total = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  } else {
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    total = incomeTotal - expenseTotal;
  }

  const summary = JSON.stringify({ metric, total, period: { dateFrom, dateTo } });
  const prompt = `Você é um assistente financeiro. O usuário perguntou sobre suas finanças. Pergunta: \"${metric} de ${dateFrom} até ${dateTo}\". Aqui está o resumo dos dados em JSON: ${summary}.\nResponda de forma clara e concisa com o valor total em Reais.`;

  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [
      { role: 'system', content: 'You are a financial assistant.' },
      { role: 'user', content: prompt }
    ],
  });

  return gptResponse.choices[0].message.content.trim();
};

module.exports = { handleQuery };