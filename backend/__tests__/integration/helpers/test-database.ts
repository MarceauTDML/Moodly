// Ne jamais pointer ces tests vers la base de démo : elle est vidée entre chaque test.
export const testDatabaseUrl = () => {
  const url = process.env.TEST_DATABASE_URL ?? 'postgresql://moodmap:moodmap@localhost:2054/moodmap_test';
  const name = new URL(url).pathname.slice(1);
  if (!name.endsWith('_test')) {
    throw new Error(`Base « ${name} » refusée : le nom d'une base de test doit se terminer par _test.`);
  }
  return url;
};
