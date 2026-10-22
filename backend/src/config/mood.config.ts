import { MoodLevel, MoodStatus, TagCategory } from '@prisma/client';
import { env } from './env.config';

export const MOOD_SCORES: Record<MoodLevel, number> = {
  EPANOUI: 100,
  BIEN: 75,
  MOYEN: 50,
  STRESSE: 25,
};

export const MOOD_LABELS: Record<MoodLevel, string> = {
  EPANOUI: 'Épanoui',
  BIEN: 'Bien',
  MOYEN: 'Moyen',
  STRESSE: 'Stressé',
};

export const STATUS_THRESHOLDS = {
  PARFAIT: 80,
  MOYENNE: 50,
} as const;

export const FLOURISHING_LEVELS: MoodLevel[] = [MoodLevel.EPANOUI];
export const STRUGGLING_LEVELS: MoodLevel[] = [MoodLevel.STRESSE];

export const STATUS_CONTENT: Record<MoodStatus, { label: string; title: string; advice: string }> = {
  PARFAIT: {
    label: 'Parfait',
    title: 'La mood map des collaborateurs est parfaite.',
    advice: 'Une belle énergie collective ! Continuez à cultiver ces moments de partage.',
  },
  MOYENNE: {
    label: 'Moyenne',
    title: 'La mood map des collaborateurs est moyenne.',
    advice: "Une énergie mitigée. Prenez le temps d'échanger et de cultiver les petits moments positifs.",
  },
  PREOCCUPANT: {
    label: 'Préoccupant',
    title: 'La mood map des collaborateurs est préoccupante.',
    advice: "Prenez le temps d'écouter l'équipe et d'agir ensemble pour améliorer son bien-être.",
  },
};

export const CHART_ZONES = [
  { key: 'IDEALE', label: 'Humeur idéale', min: STATUS_THRESHOLDS.PARFAIT, max: 100 },
  { key: 'PASSABLE', label: 'Humeur passable', min: STATUS_THRESHOLDS.MOYENNE, max: STATUS_THRESHOLDS.PARFAIT },
  { key: 'PREOCCUPANTE', label: 'Humeur préoccupante', min: 0, max: STATUS_THRESHOLDS.MOYENNE },
] as const;

export const TAG_LABELS: Record<TagCategory, string> = {
  CHARGE_DE_TRAVAIL: '#ChargeDeTravail',
  CLARTE_DES_MISSIONS: '#ClartéDesMissions',
  AMBIANCE_EQUIPE: '#AmbianceEquipe',
  SOUTIEN_MANAGER: '#SoutienManager',
  OUTILS_MATERIEL: '#Outils&Matériel',
  RECONNAISSANCE: '#Reconnaissance',
};

export const MIN_RESPONSES = env.MOOD_MIN_RESPONSES;

export const TREND_WINDOW_DAYS = 30;
export const COMMENT_MAX_LENGTH = 500;
