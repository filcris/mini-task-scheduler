// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL || 'demo@example.com';
  const password = process.env.SEED_PASSWORD || 'password123';
  const name = process.env.SEED_NAME || 'Demo User';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed: user ${email} já existe (id=${existing.id})`);
    return;
  }

  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true },
  });

  console.log('Seed: utilizador criado =>', user);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
