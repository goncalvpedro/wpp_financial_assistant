const { prisma } = require("../db/index");
const { parseISO, isValid } = require("date-fns");
// const { utcToZonedTime } = require("date-fns-tz");

const saveTransaction = async (phone, transactionData) => {
  const { amount, type, category, description, date } = transactionData;

  if (typeof phone !== "string" || !phone.trim()) {
    throw new Error("Número de telefone inválido.");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("O valor da transação deve ser um número maior que zero.");
  }
  if (!["income", "expense"].includes(type)) {
    throw new Error('O tipo deve ser "income" ou "expense".');
  }
  if (typeof category !== "string" || !category.trim()) {
    throw new Error("Categoria inválida.");
  }
  if (typeof description !== "string") {
    throw new Error("Descrição inválida.");
  }
  const parsed = parseISO(date);
  if (!isValid(parsed)) {
    throw new Error("Data inválida. Use o formato ISO (YYYY-MM-DD).");
  }

  

  try {
    const { user, transaction } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { phone },
        update: {},
        create: { phone },
      });

      const txCreated = await tx.transaction.create({
        data: {
          user_id: user.id,
          amount,
          type,
          category,
          description,
          date: parsed,
        },
      });

      return { user, transaction: txCreated };
    });

    const dateFormatted = transaction.date.toLocaleDateString("pt-BR");
    return `Registrado ${transaction.amount} BRL de ${transaction.type} em ${transaction.category} na data ${dateFormatted}.`;
  } catch (error) {
    console.error("Erro ao salvar transação:", error);
    throw new Error("Não foi possível registrar a transação. Tente novamente mais tarde.");
  }
};

module.exports = { saveTransaction };
