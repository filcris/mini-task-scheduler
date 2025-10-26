import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  const now = new Date();
  await prisma.task.createMany({
    data: [
      { title: 'Comprar café', priority: 'medium', ownerId: user.id, dueAt: new Date(now.getTime() + 86400000) },
      { title: 'Fechar relatório', priority: 'high', ownerId: user.id },
      { title: 'Lavar o carro', priority: 'low', ownerId: user.id, dueAt: new Date(now.getTime() - 86400000) },
    ],
  });
}
main().finally(() => prisma.$disconnect());

