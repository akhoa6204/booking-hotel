import prisma from "../lib/prisma.js";

export async function findCustomerById(user_id) {
  return await prisma.customer.findUnique({ id: Number(user_id) });
}
