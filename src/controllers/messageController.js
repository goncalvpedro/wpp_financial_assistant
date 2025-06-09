const { parseUserInput } = require('../services/gptService');
const { saveTransaction } = require('../services/financeParser');
const { handleQuery } = require('../services/queryService');
const { sendWhatsAppMessage } = require('../services/whatsappService');

const handleIncomingMessage = async (req, res) => {
  try {
    const { from, body } = req.body;
    const inputData = await parseUserInput(body);

    let responseText;
    if (inputData.intent === 'transaction') {
      responseText = await saveTransaction(from, inputData);
    } else if (inputData.intent === 'query') {
      responseText = await handleQuery(from, inputData);
    } else {
      responseText = 'Desculpe, não entendi sua solicitação.';
    }

    await sendWhatsAppMessage(from, responseText);
    res.status(200).send({ status: 'ok' });
  } catch (err) {
    console.error('Error handling message:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
};

module.exports = { handleIncomingMessage };