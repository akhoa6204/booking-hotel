import { app } from "./app.js";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";
import { initSocket } from "./lib/socket.js";
import http from "http";

dotenv.config();
const PORT = process.env.PORT || 3001;

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  const server = http.createServer(app);

  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Hotel API listening on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});
