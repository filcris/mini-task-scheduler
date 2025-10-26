// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL || 'demo@example.com';
  const password = process.env.SEED_PASSWORD || 'password123';
  const name = process.env.SEED_NAME || 'Demo User';

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = await argon2.hash(password);
    user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true },
    });
    console.log('Seed user =>', user);
  } else {
    console.log(`Seed: user ${email} já existe (id=${user.id})`);
  }

  // 2 tasks demo (idempotente)
  const existing = await prisma.task.findMany({ where: { ownerId: user.id } });
  if (existing.length === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: 'Primeira task demo',
          description: 'Isto aparece no frontend',
          priority: 'MEDIUM',
          status: 'TODO',
          ownerId: user.id,
        },
        {
          title: 'Task atrasada',
          description: 'Para testar overdue',
          priority: 'HIGH',
          status: 'INPROGRESS',
          dueDate: new Date(Date.now() - 24 * 3600 * 1000), // ontem
          ownerId: user.id,
        },
      ],
    });
    console.log('Seed: 2 tasks de exemplo criadas');
  } else {
    console.log(`Seed: utilizador já tem ${existing.length} tasks — sem duplicar`);
  }
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
