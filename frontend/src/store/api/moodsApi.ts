import { baseApi } from './baseApi';
import {
  moodOptionsSchema,
  todayCheckinSchema,
  moodSubmissionSchema,
} from '../../services/checkin.schemas';
import type {
  MoodOptions,
  TodayCheckin,
  MoodSubmission,
  SubmitMoodInput,
} from '../../types/checkin.types';

export const moodsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    moodOptions: build.query<MoodOptions, void>({
      query: () => ({ url: '/moods/options', schema: moodOptionsSchema }),
    }),
    todayCheckin: build.query<TodayCheckin, void>({
      query: () => ({ url: '/moods/today', schema: todayCheckinSchema }),
      providesTags: ['DailyCheckin'],
    }),
    submitMood: build.mutation<MoodSubmission, SubmitMoodInput>({
      query: (body) => ({ url: '/moods', method: 'POST', body, schema: moodSubmissionSchema }),
      invalidatesTags: (result) => (result ? ['DailyCheckin'] : []),
    }),
  }),
});
export const { useMoodOptionsQuery, useTodayCheckinQuery, useSubmitMoodMutation } = moodsApi;
