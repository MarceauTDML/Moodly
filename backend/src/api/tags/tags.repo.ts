import type { TagCategory } from '@prisma/client';
import { prisma } from '../../config/prisma.config';

const tagSelect = { id: true, code: true, label: true } as const;

export const tagsRepo = {
  findAll: () => prisma.tag.findMany({ select: tagSelect, orderBy: { createdAt: 'asc' } }),

  findByCode: (code: TagCategory) => prisma.tag.findUnique({ where: { code }, select: tagSelect }),

  findByCodes: (codes: TagCategory[]) => prisma.tag.findMany({ where: { code: { in: codes } }, select: tagSelect }),
};
