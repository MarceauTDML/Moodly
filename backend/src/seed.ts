import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const hash = await argon2.hash('MonSuperMotDePasse123!');

  // Création de l'entreprise et du Manager en une seule opération
  const company = await prisma.company.upsert({
    where: { domain: 'entreprise.com' },
    update: {},
    create: {
      name: 'Mon Entreprise',
      domain: 'entreprise.com',
      users: {
        create: {
          email: 'manager@entreprise.com',
          passwordHash: hash,
          firstName: 'Jean',
          lastName: 'Dupont',
          role: Role.MANAGER,
        },
      },
    },
    include: {
      users: true,
    },
  });

  console.log('Entreprise et Manager initialisés avec succès !');
  console.log('Utilisateur créé :', company.users[0]?.email);
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });