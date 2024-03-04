import { PrismaClient } from "@prisma/client";

export const prismaConnection = new PrismaClient({
  errorFormat: "pretty",
  log: ["error"]
});
