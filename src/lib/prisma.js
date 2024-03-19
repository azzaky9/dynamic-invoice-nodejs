const { PrismaClient } = require("@prisma/client");

module.exports = prismaConnection = new PrismaClient({
  errorFormat: "pretty",
  log: ["error"]
});
