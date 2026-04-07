const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando setup do Frame Photo Printer...\n');

  // Criar admin padrão
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@framephoto.local';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

  try {
    // Verificar se admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✅ Admin já existe:', adminEmail);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password_hash: passwordHash,
          role: 'admin',
          name: 'Administrador',
        },
      });

      console.log('✅ Admin criado com sucesso!');
      console.log('   Email:', adminEmail);
      console.log('   Senha:', adminPassword);
      console.log('   ⚠️  MUDE A SENHA após o primeiro login!\n');
    }
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
  }

  // Criar molduras padrão
  try {
    const frameCount = await prisma.frame.count();

    if (frameCount === 0) {
      await prisma.frame.createMany({
        data: [
          {
            name: '15x21 Retrato',
            width_mm: 150,
            height_mm: 210,
            border_px: 40,
            active: true,
          },
          {
            name: '15x21 Paisagem',
            width_mm: 210,
            height_mm: 150,
            border_px: 40,
            active: true,
          },
        ],
      });

      console.log('✅ Molduras padrão criadas (15x21 Retrato e Paisagem)');
    } else {
      console.log('✅ Molduras já existem no banco de dados');
    }
  } catch (error) {
    console.error('❌ Erro ao criar molduras:', error.message);
  }

  console.log('\n🎉 Setup concluído!\n');
  console.log('Próximos passos:');
  console.log('  1. npm run dev (desenvolvimento)');
  console.log('  2. Acesse http://localhost:3000/admin/login');
  console.log('  3. Faça login com as credenciais acima');
  console.log('  4. Configure impressoras e crie operadores\n');
}

main()
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
