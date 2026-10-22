const model = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
});

export const prismaMock = {
  user: model(),
  team: model(),
  teamMember: model(),
  company: model(),
  tag: model(),
  moodEntry: model(),
  moodEntryTag: model(),
  moodSnapshot: model(),
  userDailyCheckin: model(),
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

export type PrismaMock = typeof prismaMock;
