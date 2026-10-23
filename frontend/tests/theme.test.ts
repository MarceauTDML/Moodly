import assert from 'node:assert/strict';
import { test } from 'node:test';
import { darkColors, lightColors, type Palette } from '../src/theme/colors';

// Contraste WCAG 2.1 entre deux couleurs opaques #RRGGBB.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

// Texte courant : 4,5:1 minimum. Texte secondaire et éléments graphiques : 3:1.
const pairs: [keyof Palette, keyof Palette, number][] = [
  ['text', 'background', 4.5],
  ['text', 'surface', 4.5],
  ['textStrong', 'surface', 4.5],
  ['onPrimary', 'primary', 4.5],
  ['primary', 'surface', 3],
  ['primary', 'primarySoft', 3],
  ['muted', 'surface', 3],
  ['danger', 'surface', 3],
  ['success', 'surface', 3],
];

for (const [name, palette] of [
  ['clair', lightColors],
  ['sombre', darkColors],
] as const) {
  test(`Le thème ${name} garde des contrastes lisibles`, () => {
    for (const [fg, bg, min] of pairs) {
      const ratio = contrast(palette[fg], palette[bg]);
      assert.ok(ratio >= min, `${fg} sur ${bg} : ${ratio.toFixed(2)} < ${min}`);
    }
  });
}

test('Les deux thèmes définissent exactement les mêmes couleurs', () => {
  assert.deepEqual(Object.keys(darkColors).sort(), Object.keys(lightColors).sort());
});
