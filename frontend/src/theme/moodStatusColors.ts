import type { MoodStatus } from '../types/mood.types';
import type { ColorScheme } from './ThemeProvider';

interface StatusPalette {
  hero: string;
  background: string;
  text: string;
  muted: string;
  accent: string;
  face: string;
  cheek: string;
}

const light = {
  PARFAIT: {
    hero: '#EBE7F5',
    background: '#F4F0FA',
    text: '#292E68',
    muted: '#8B8DB2',
    accent: '#568568',
    face: '#FFDA69',
    cheek: '#F2AE76',
  },
  MOYENNE: {
    hero: '#DFE7EF',
    background: '#ECF1F6',
    text: '#28395C',
    muted: '#7C90AB',
    accent: '#CD893C',
    face: '#F5D78F',
    cheek: '#E7BA8D',
  },
  PREOCCUPANT: {
    hero: '#37465D',
    background: '#EDF1F6',
    text: '#F5F6FB',
    muted: '#C2CBDA',
    accent: '#C16475',
    face: '#C9DAED',
    cheek: '#A5BEDC',
  },
} satisfies Record<MoodStatus, StatusPalette>;

// Mêmes visages et accents, fonds assombris.
const dark = {
  PARFAIT: {
    ...light.PARFAIT,
    hero: '#2A2752',
    background: '#181A2E',
    text: '#ECEBFA',
    muted: '#A9A8CC',
    accent: '#7CC497',
  },
  MOYENNE: {
    ...light.MOYENNE,
    hero: '#22303F',
    background: '#151C26',
    text: '#E3EAF3',
    muted: '#9EB0C6',
    accent: '#E5A85F',
  },
  PREOCCUPANT: { ...light.PREOCCUPANT, background: '#121722', accent: '#F08E9C' },
} satisfies Record<MoodStatus, StatusPalette>;

export const moodStatusColors: Record<ColorScheme, Record<MoodStatus, StatusPalette>> = {
  light,
  dark,
};
