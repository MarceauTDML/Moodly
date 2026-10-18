import type { TagCategory } from '@prisma/client';

export interface TagDto {
  id: string;
  code: TagCategory;
  label: string;
}

export interface TagStat {
  code: TagCategory;
  label: string;
  count: number;
  percentage: number;
  averageScore: number | null;
}
