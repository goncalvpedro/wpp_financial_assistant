const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const initDB = async () => {
  await prisma.$connect();
  console.log("Connected to database.");
};

module.exports = { prisma, initDB };
