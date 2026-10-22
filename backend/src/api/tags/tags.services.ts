import type { TagCategory } from '@prisma/client';
import type { TagDto } from '../../types/tag.types';
import { ApiError } from '../../utils/response.util';
import { tagsRepo } from './tags.repo';

export const tagsService = {
  list: (): Promise<TagDto[]> => tagsRepo.findAll(),

  async getByCode(code: TagCategory): Promise<TagDto> {
    const tag = await tagsRepo.findByCode(code);
    if (!tag) throw ApiError.notFound('Tag introuvable');
    return tag;
  },
};
