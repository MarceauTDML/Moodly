import type { z } from 'zod';
import type {
  moodOptionsSchema,
  todayCheckinSchema,
  moodSubmissionSchema,
  submitMoodInputSchema,
} from '../services/checkin.schemas';

export type MoodOptions = z.infer<typeof moodOptionsSchema>;
export type TodayCheckin = z.infer<typeof todayCheckinSchema>;
export type MoodSubmission = z.infer<typeof moodSubmissionSchema>;
export type SubmitMoodInput = z.infer<typeof submitMoodInputSchema>;
export type CheckinMood = SubmitMoodInput['mood'];
export type CheckinTag = SubmitMoodInput['tags'][number];
