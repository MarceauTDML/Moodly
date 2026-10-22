import { baseApi } from './baseApi';
import { profileSchema, notificationsSchema, teamsSchema } from '../../services/api.schemas';
import type { NotificationSettings, Profile } from '../../types/user.types';
import type { Team } from '../../types/team.types';
export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    profile: build.query<Profile, void>({
      query: () => ({ url: '/users/me', schema: profileSchema }),
      providesTags: ['Profile'],
    }),
    updateProfile: build.mutation<unknown, { firstName: string; lastName: string }>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
    changePassword: build.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({ query: (body) => ({ url: '/users/me/password', method: 'PATCH', body }) }),
    notificationSettings: build.query<NotificationSettings, void>({
      query: () => ({ url: '/users/me/notifications', schema: notificationsSchema }),
      providesTags: ['Notifications'],
    }),
    updateNotifications: build.mutation<
      NotificationSettings,
      Partial<Pick<NotificationSettings, 'dailyReminderEnabled' | 'emailNotificationsEnabled'>>
    >({
      query: (body) => ({
        url: '/users/me/notifications',
        method: 'PATCH',
        body,
        schema: notificationsSchema,
      }),
      invalidatesTags: ['Notifications'],
    }),
    teams: build.query<Team[], void>({
      query: () => ({ url: '/teams', schema: teamsSchema }),
      providesTags: ['Teams'],
    }),
  }),
});
export const {
  useProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useNotificationSettingsQuery,
  useUpdateNotificationsMutation,
  useTeamsQuery,
} = usersApi;
