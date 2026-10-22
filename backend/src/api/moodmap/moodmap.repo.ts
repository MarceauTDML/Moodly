import { prisma } from '../../config/prisma.config';

export const moodmapRepo = {
  findLatestSnapshot: (teamId: string, minResponses: number) =>
    prisma.moodSnapshot.findFirst({
      where: { teamId, totalResponses: { gte: minResponses } },
      orderBy: { date: 'desc' },
    }),

  findSnapshots: (teamId: string, from: Date, to: Date) =>
    prisma.moodSnapshot.findMany({
      where: { teamId, date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
    }),

  countVoters: (teamId: string) => prisma.teamMember.count({ where: { teamId, isLead: false } }),

  findEntries: (teamId: string, from: Date, toExclusive: Date) =>
    prisma.moodEntry.findMany({
      where: { teamId, submittedAt: { gte: from, lt: toExclusive } },
      select: {
        mood: true,
        comment: true,
        tags: { select: { tag: { select: { code: true, label: true } } } },
      },
    }),

  findAllTags: () => prisma.tag.findMany({ select: { code: true, label: true }, orderBy: { createdAt: 'asc' } }),
};
