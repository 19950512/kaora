const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  // Criar um business de teste
  const business = await prisma.business.upsert({
    where: { email: 'teste@empresa.com' },
    update: {},
    create: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Empresa Teste',
      email: 'teste@empresa.com',
      document: '12345678000199',
      phone: '11999999999',
      whatsapp: '11999999999',
      active: true,
    },
  });

  console.log('Business criado:', business);

  // Criar um usuário de teste
  const user = await prisma.user.upsert({
    where: { 
      businessId_email: {
        businessId: business.id,
        email: 'admin@empresa.com'
      }
    },
    update: {},
    create: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      businessId: business.id,
      name: 'Admin Teste',
      email: 'admin@empresa.com',
      passwordHash: 'hashed_password',
      document: '12345678901',
      phone: '11888888888',
      active: true,
    },
  });

  console.log('Usuário criado:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
