import type { Team } from '@prisma/client';
import type { AuthUser } from '../../types/auth.types';
import { teamsRepo } from './teams.repo';
import type { CreateTeamInput, UpdateTeamInput } from './teams.validators';

type TeamRow = Awaited<ReturnType<typeof teamsRepo.listForCompany>>[number];

const toTeamDto = ({ _count, ...team }: TeamRow) => ({ ...team, memberCount: _count.members });

const toMemberDto = (m: Awaited<ReturnType<typeof teamsRepo.findMembers>>[number]) => ({
  ...m.user,
  isLead: m.isLead,
  joinedAt: m.joinedAt,
});

export const teamsService = {
  async list(user: AuthUser) {
    const teams =
      user.role === 'ADMIN'
        ? await teamsRepo.listForCompany(user.companyId)
        : await teamsRepo.listForUser(user.id, user.role === 'MANAGER');
    return teams.map(toTeamDto);
  },

  async get(team: Team) {
    const members = await teamsRepo.findMembers(team.id);
    return {
      id: team.id,
      name: team.name,
      companyId: team.companyId,
      createdAt: team.createdAt,
      memberCount: members.length,
      members: members.map(toMemberDto),
    };
  },

  async create(user: AuthUser, input: CreateTeamInput) {
    return toTeamDto(await teamsRepo.create(user.companyId, input.name));
  },

  async update(team: Team, input: UpdateTeamInput) {
    return toTeamDto(await teamsRepo.update(team.id, input.name));
  },

  async remove(team: Team) {
    await teamsRepo.delete(team.id);
  },
};
