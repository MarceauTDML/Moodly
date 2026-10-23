// SUPPORT_RESOURCES est lu au démarrage : chaque cas recharge la configuration.
const loadEnv = (raw: string | undefined) => {
  const previous = process.env.SUPPORT_RESOURCES;
  if (raw === undefined) delete process.env.SUPPORT_RESOURCES;
  else process.env.SUPPORT_RESOURCES = raw;
  try {
    let env: typeof import('../../src/config/env.config').env | undefined;
    jest.isolateModules(() => {
      env = require('../../src/config/env.config').env;
    });
    return env!;
  } finally {
    if (previous === undefined) delete process.env.SUPPORT_RESOURCES;
    else process.env.SUPPORT_RESOURCES = previous;
  }
};

describe('Contacts d’aide de l’entreprise (SUPPORT_RESOURCES)', () => {
  it('est facultatif', () => {
    expect(loadEnv(undefined).SUPPORT_RESOURCES).toEqual([]);
  });

  it('accepte une liste de contacts', () => {
    const resources = [
      { label: 'Psychologue d’entreprise', phone: '01 23 45 67 89', description: 'Confidentiel' },
      { label: 'Ligne d’écoute', url: 'https://ecoute.example.org' },
    ];
    expect(loadEnv(JSON.stringify(resources)).SUPPORT_RESOURCES).toEqual(resources);
  });

  it.each(['pas du json', '[{"label":"Site","url":"http://non-securise.example.org"}]'])(
    'arrête le serveur avec un message si la valeur est invalide (%s)',
    (raw) => {
      const exit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('exit');
      });
      const stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
      try {
        expect(() => loadEnv(raw)).toThrow('exit');
        expect(String(stderr.mock.calls[0]?.[0])).toContain('SUPPORT_RESOURCES');
      } finally {
        exit.mockRestore();
        stderr.mockRestore();
      }
    },
  );
});
