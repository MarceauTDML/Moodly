import { prisma } from '../../config/prisma.config';
import { Role } from '@prisma/client';
import { PENDING_ACTIVATION_HASH } from '../../config/auth.config';

export const authRepo = {
  findInvitation: (hash: string) =>
    prisma.user.findFirst({
      where: {
        invitationToken: hash,
        invitationTokenExpiry: { gt: new Date() },
        passwordHash: PENDING_ACTIVATION_HASH,
      },
    }),
  activate: (id: string, hash: string, passwordHash: string) =>
    prisma.user.updateMany({
      where: {
        id,
        invitationToken: hash,
        invitationTokenExpiry: { gt: new Date() },
        passwordHash: PENDING_ACTIVATION_HASH,
      },
      data: {
        passwordHash,
        invitationToken: null,
        invitationTokenExpiry: null,
      },
    }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  // Recherche par e-mail dans la base PostgreSQL
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  // Création d'un collaborateur
  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    companyId: string;
    role?: Role;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        companyId: data.companyId,
        role: data.role ?? Role.COLLABORATEUR,
      },
    });
  },

  // Mise à jour de l'utilisateur
  async updateUser(email: string, updates: { passwordHash?: string; role?: Role }) {
    return prisma.user.update({
      where: { email },
      data: updates,
    });
  },
};
