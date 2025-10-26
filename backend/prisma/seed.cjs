// backend/prisma/seed.cjs
/* Seed em CommonJS para evitar ts-node no container */
const { PrismaClient, Role, Priority, Status } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // cria/utilizadores base
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash,
      name: 'Admin',
      role: Role.ADMIN,
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: 'demo@demo.com' },
    update: {},
    create: {
      email: 'demo@demo.com',
      passwordHash,
      name: 'Demo User',
      role: Role.USER,
    },
  });

  // algumas tasks exemplo para o demo
  await prisma.task.createMany({
    data: [
      {
        title: 'Bem-vindo 👋',
        description: 'Primeira task seed',
        priority: Priority.MEDIUM,
        status: Status.TODO,
        ownerId: demo.id,
      },
      {
        title: 'Explorar a app',
        description: 'Criar/editar/apagar tarefas',
        priority: Priority.HIGH,
        status: Status.INPROGRESS,
        ownerId: demo.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed concluído. Utilizadores criados:');
  console.log('   admin@demo.com / password123');
  console.log('   demo@demo.com  / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
