import { prisma } from '../../config/prisma.config';
import { Role } from '@prisma/client';

export const authRepo = {
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