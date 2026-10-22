import { MoodLevel, PrismaClient, Role, TagCategory } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { TAG_LABELS } from '../src/config/mood.config';
import { upsertSnapshot } from '../src/services/mood-score.service';
import { addDays, dayRange, formatDay, today } from '../src/utils/date.util';
import { hashPassword } from '../src/utils/hash.util';

const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'MoodMap2026!';
const DAYS = 30;

let state = 20261015;
const rand = () => {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(items: T[]): T => items[Math.floor(rand() * items.length)];
const gaussian = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());

const LEVELS: [MoodLevel, number][] = [
  [MoodLevel.EPANOUI, 100],
  [MoodLevel.BIEN, 75],
  [MoodLevel.MOYEN, 50],
  [MoodLevel.STRESSE, 25],
];

const moodAround = (target: number): MoodLevel => {
  const value = target + gaussian() * 14;
  return LEVELS.reduce((best, cur) => (Math.abs(cur[1] - value) < Math.abs(best[1] - value) ? cur : best))[0];
};

const TAGS_BY_MOOD: Record<MoodLevel, TagCategory[]> = {
  EPANOUI: ['AMBIANCE_EQUIPE', 'RECONNAISSANCE', 'SOUTIEN_MANAGER', 'CLARTE_DES_MISSIONS'],
  BIEN: ['AMBIANCE_EQUIPE', 'CLARTE_DES_MISSIONS', 'OUTILS_MATERIEL', 'RECONNAISSANCE'],
  MOYEN: ['CHARGE_DE_TRAVAIL', 'OUTILS_MATERIEL', 'CLARTE_DES_MISSIONS'],
  STRESSE: ['CHARGE_DE_TRAVAIL', 'SOUTIEN_MANAGER', 'OUTILS_MATERIEL', 'RECONNAISSANCE'],
};

const COMMENTS: Record<MoodLevel, string[]> = {
  EPANOUI: ['Super rétro d’équipe aujourd’hui !', 'Mise en prod réussie, bravo à tous.', 'Belle reconnaissance du client.'],
  BIEN: ['Journée productive.', 'Bonne réunion de lancement.', 'RAS, tout roule.'],
  MOYEN: ['Beaucoup de réunions, peu de temps pour avancer.', 'Le VPN a encore coupé plusieurs fois.', 'Priorités un peu floues.'],
  STRESSE: ['Trop de sujets urgents en parallèle.', 'Deadline intenable cette semaine.', 'Besoin de plus de soutien sur le projet.'],
};

const FIRST_NAMES = ['Léa', 'Hugo', 'Chloé', 'Louis', 'Emma', 'Gabriel', 'Inès', 'Raphaël', 'Jade', 'Arthur', 'Manon', 'Jules', 'Sarah', 'Adam', 'Lina', 'Nathan', 'Zoé', 'Tom', 'Alice', 'Noah', 'Camille', 'Ethan', 'Louise', 'Paul', 'Nina', 'Lucas', 'Eva', 'Sacha', 'Mila', 'Théo', 'Rose', 'Maël'];
const LAST_NAMES = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupuis', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre', 'Mercier'];

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

async function main() {
  console.log('🧹 Nettoyage de la base…');
  await prisma.moodEntryTag.deleteMany();
  await prisma.moodEntry.deleteMany();
  await prisma.moodSnapshot.deleteMany();
  await prisma.userDailyCheckin.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.company.deleteMany();
  await prisma.tag.deleteMany();

  console.log('🏷️  Tags…');
  const tags = [];
  for (const [code, label] of Object.entries(TAG_LABELS) as [TagCategory, string][]) {
    tags.push(await prisma.tag.create({ data: { code, label } }));
  }
  const tagId = new Map(tags.map((t) => [t.code, t.id]));

  console.log('🏢 Entreprise, équipes et utilisateurs…');
  const company = await prisma.company.create({ data: { name: 'Entreprise Démo', domain: 'entreprise.fr' } });
  const passwordHash = await hashPassword(SEED_PASSWORD);

  const createUser = (firstName: string, lastName: string, role: Role, email?: string) =>
    prisma.user.create({
      data: {
        email: email ?? `${slug(firstName)}.${slug(lastName)}@entreprise.fr`,
        firstName,
        lastName,
        role,
        companyId: company.id,
        passwordHash,
      },
    });

  await createUser('Admin', 'MoodMap', Role.ADMIN, 'admin@entreprise.fr');
  const managerProduit = await createUser('Camille', 'Martin', Role.MANAGER, 'manager@entreprise.fr');
  const managerSupport = await createUser('Julien', 'Moreau', Role.MANAGER, 'manager.support@entreprise.fr');

  const teams = [
    { name: 'Équipe Produit', manager: managerProduit, size: 24, target: (p: number) => 50 + p * 46 },
    { name: 'Équipe Support', manager: managerSupport, size: 10, target: (p: number) => 68 - p * 38 },
  ];

  const end = today();
  const days = dayRange(end, DAYS);
  let nameIndex = 0;

  for (const def of teams) {
    const team = await prisma.team.create({ data: { name: def.name, companyId: company.id } });
    await prisma.teamMember.create({ data: { teamId: team.id, userId: def.manager.id, isLead: true } });

    const members: {
      user: Awaited<ReturnType<typeof createUser>>;
      isDemo: boolean;
    }[] = [];
    for (let i = 0; i < def.size; i++) {
      const isDemo = def.name === 'Équipe Produit' && i === 0;
      const first = isDemo ? 'Léa' : FIRST_NAMES[nameIndex % FIRST_NAMES.length];
      const last = isDemo ? 'Dupont' : LAST_NAMES[(nameIndex * 7) % LAST_NAMES.length];
      nameIndex++;
      const user = await createUser(first, last, Role.COLLABORATEUR, isDemo ? 'collaborateur@entreprise.fr' : `${slug(first)}.${slug(last)}.${nameIndex}@entreprise.fr`);
      await prisma.teamMember.create({ data: { teamId: team.id, userId: user.id } });
      members.push({ user, isDemo });
    }

    console.log(`📈 ${def.name} : ${DAYS} jours d'historique…`);
    const checkins: { userId: string; date: Date }[] = [];
    const entries: { id: string; teamId: string; mood: MoodLevel; comment: string | null; submittedAt: Date }[] = [];
    const entryTags: { moodEntryId: string; tagId: string }[] = [];

    days.forEach((day, index) => {
      const progress = index / (DAYS - 1);
      for (const { user, isDemo } of members) {
        if (isDemo && formatDay(day) === formatDay(end)) continue;
        if (rand() > 0.9) continue;

        const mood = moodAround(def.target(progress));
        const id = randomUUID();
        checkins.push({ userId: user.id, date: day });
        entries.push({ id, teamId: team.id, mood, comment: rand() < 0.15 ? pick(COMMENTS[mood]) : null, submittedAt: day });

        const tagCount = Math.floor(rand() * 3);
        const chosen = new Set<TagCategory>();
        for (let t = 0; t < tagCount; t++) chosen.add(pick(TAGS_BY_MOOD[mood]));
        for (const code of chosen) entryTags.push({ moodEntryId: id, tagId: tagId.get(code)! });
      }
    });

    await prisma.userDailyCheckin.createMany({ data: checkins.map((c) => ({ ...c, createdAt: c.date })) });
    await prisma.moodEntry.createMany({ data: entries });
    await prisma.moodEntryTag.createMany({ data: entryTags });

    for (const day of days) await upsertSnapshot(team.id, day);
    const last = await prisma.moodSnapshot.findUnique({ where: { teamId_date: { teamId: team.id, date: end } } });
    console.log(`   → ${entries.length} votes, score du jour ${last?.averageScore}/100 (${last?.status})`);
  }

  console.log(`✅ Seed terminé (${formatDay(addDays(end, -(DAYS - 1)))} → ${formatDay(end)}).`);
  console.log('   Comptes de démo (mot de passe : SEED_PASSWORD du .env) :');
  console.log('   - admin@entreprise.fr           (ADMIN)');
  console.log('   - manager@entreprise.fr         (MANAGER, Équipe Produit)');
  console.log('   - manager.support@entreprise.fr (MANAGER, Équipe Support)');
  console.log('   - collaborateur@entreprise.fr   (COLLABORATEUR, Équipe Produit, pas encore voté aujourd’hui)');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
