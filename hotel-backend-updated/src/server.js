import { app } from "./app.js";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";

dotenv.config();
const PORT = process.env.PORT || 3001;

async function main() {
  // Check DB connection early
  await prisma.$queryRaw`SELECT 1`;
  app.listen(PORT, () => {
    console.log(`Hotel API listening on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});
