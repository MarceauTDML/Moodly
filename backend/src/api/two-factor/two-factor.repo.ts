import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.config';

export const twoFactorRepo = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  update: (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data }),

  // Écriture conditionnelle : un code n'est accepté qu'une fois, même si deux requêtes
  // arrivent en même temps. Renvoie true si ce code vient d'être consommé.
  consume: async (id: string, where: Prisma.UserWhereInput, data: Prisma.UserUpdateManyMutationInput) =>
    (
      await prisma.user.updateMany({
        where: { id, ...where },
        data: { ...data, twoFactorAttempts: 0, twoFactorLockedUntil: null },
      })
    ).count === 1,
};
