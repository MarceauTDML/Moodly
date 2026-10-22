import { MoodLevel, Prisma } from '@prisma/client';
import { MOOD_LABELS, MOOD_SCORES } from '../../config/mood.config';
import type { AuthUser } from '../../types/auth.types';
import { formatDay, today } from '../../utils/date.util';
import { ApiError } from '../../utils/response.util';
import { tagsRepo } from '../tags/tags.repo';
import { moodsRepo } from './moods.repo';
import type { SubmitMoodInput } from './moods.validators';

export const moodsService = {
  async getOptions() {
    return {
      question: "Comment s'est passée ta journée ?",
      tagsQuestion: "Qu'est-ce qui a influencé ton humeur ?",
      commentPlaceholder: 'Ajoute un détail si tu veux…',
      moods: Object.values(MoodLevel).map((code) => ({ code, label: MOOD_LABELS[code], score: MOOD_SCORES[code] })),
      tags: await tagsRepo.findAll(),
    };
  },

  async getTodayStatus(userId: string) {
    const day = today();
    const [hasSubmittedToday, memberships] = await Promise.all([
      moodsRepo.hasCheckin(userId, day),
      moodsRepo.findVotingTeams(userId),
    ]);
    const teams = memberships.map((m) => m.team);
    return {
      date: formatDay(day),
      hasSubmittedToday,
      canSubmit: !hasSubmittedToday && teams.length > 0,
      requiresTeamChoice: teams.length > 1,
      teams,
    };
  },

  async submit(user: AuthUser, input: SubmitMoodInput) {
    const teams = (await moodsRepo.findVotingTeams(user.id)).map((m) => m.team);
    if (teams.length === 0) {
      throw ApiError.forbidden("Vous n'êtes rattaché à aucune équipe pour partager votre mood", 'NO_TEAM');
    }

    let teamId = input.teamId;
    if (teamId && !teams.some((t) => t.id === teamId)) {
      throw ApiError.forbidden("Vous n'êtes pas membre de cette équipe", 'NOT_TEAM_MEMBER');
    }
    if (!teamId) {
      if (teams.length > 1) throw ApiError.badRequest('Précisez l’équipe concernée (teamId)', 'TEAM_REQUIRED');
      teamId = teams[0].id;
    }

    const tags = input.tags.length ? await tagsRepo.findByCodes(input.tags) : [];
    const day = today();

    try {
      await moodsRepo.createAnonymousEntry({
        userId: user.id,
        teamId,
        day,
        mood: input.mood,
        comment: input.comment,
        tagIds: tags.map((t) => t.id),
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw ApiError.conflict("Tu as déjà partagé ton mood aujourd'hui. Reviens demain !", 'ALREADY_SUBMITTED');
      }
      throw err;
    }

    return {
      date: formatDay(day),
      title: 'Ton mood a bien été envoyé !',
      message: 'Merci pour ta participation. Ta réponse restera anonyme.',
    };
  },
};
