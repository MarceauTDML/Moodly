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
};
