import { prisma } from '../../config/prisma.config';

export const passwordRepo = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  setResetToken: (userId: string, tokenHash: string, expiry: Date) =>
    prisma.user.update({ where: { id: userId }, data: { resetToken: tokenHash, resetTokenExpiry: expiry } }),

  findByValidResetToken: (tokenHash: string) =>
    prisma.user.findFirst({ where: { resetToken: tokenHash, resetTokenExpiry: { gt: new Date() } } }),

  updatePassword: (userId: string, passwordHash: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    }),
};
