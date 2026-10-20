import {
  anonymizeComments,
  hasEnoughResponses,
  maskBelowThreshold,
  scrubComment,
  shuffle,
} from '../../src/services/anonymization.service';

describe('anonymization.service', () => {
  it('applique le seuil minimum de réponses (MOOD_MIN_RESPONSES = 3)', () => {
    expect(hasEnoughResponses(2)).toBe(false);
    expect(hasEnoughResponses(3)).toBe(true);
    expect(maskBelowThreshold(42, 2)).toBeNull();
    expect(maskBelowThreshold(42, 5)).toBe(42);
  });

  it('retire e-mails, téléphones et liens des commentaires', () => {
    expect(scrubComment('Écrivez-moi à lea.dupont@entreprise.fr')).toBe('Écrivez-moi à [email]');
    expect(scrubComment('Appelle au 06 12 34 56 78 stp')).toBe('Appelle au [téléphone] stp');
    expect(scrubComment('Voir https://intranet.local/doc  ici')).toBe('Voir [lien] ici');
  });

  it('ne renvoie aucun commentaire sous le seuil', () => {
    expect(anonymizeComments(['un', 'deux'], 2)).toEqual([]);
  });

  it('filtre les commentaires vides et limite le nombre', () => {
    const result = anonymizeComments(['a', null, '  ', 'b', 'c'], 10, 2);
    expect(result).toHaveLength(2);
    result.forEach((c) => expect(['a', 'b', 'c']).toContain(c));
  });

  it('mélange sans perdre ni dupliquer d’élément', () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const shuffled = shuffle(items);
    expect(shuffled).toHaveLength(50);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
    expect(items[0]).toBe(0);
  });
});
