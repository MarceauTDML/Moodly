import type { MoodLevel } from '@prisma/client';
import { prisma } from '../../config/prisma.config';

export interface AnonymousEntryInput {
  userId: string;
  teamId: string;
  day: Date;
  mood: MoodLevel;
  comment?: string;
  tagIds: string[];
}

export const moodsRepo = {
  findVotingTeams: (userId: string) =>
    prisma.teamMember.findMany({
      where: { userId, isLead: false },
      select: { team: { select: { id: true, name: true } } },
      orderBy: { joinedAt: 'asc' },
    }),

  hasCheckin: async (userId: string, day: Date) =>
    (await prisma.userDailyCheckin.count({ where: { userId, date: day } })) > 0,

  createAnonymousEntry: ({ userId, teamId, day, mood, comment, tagIds }: AnonymousEntryInput) =>
    prisma.$transaction(async (tx) => {
      await tx.userDailyCheckin.create({ data: { userId, date: day, createdAt: day } });
      await tx.moodEntry.create({
        data: {
          teamId,
          mood,
          comment: comment ?? null,
          submittedAt: day,
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
        },
        select: { id: true },
      });
    }),
};
