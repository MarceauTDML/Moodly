import type { MoodStatus } from '../types/mood.types';
export const moodStatusColors = {
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
} satisfies Record<
  MoodStatus,
  {
    hero: string;
    background: string;
    text: string;
    muted: string;
    accent: string;
    face: string;
    cheek: string;
  }
>;
