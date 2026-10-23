import { baseApi } from './baseApi';
import {
  profileSchema,
  notificationsSchema,
  teamsSchema,
  personalDataSchema,
} from '../../services/api.schemas';
import type { NotificationSettings, PersonalData, Profile } from '../../types/user.types';
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
    personalData: build.query<PersonalData, void>({
      query: () => ({ url: '/users/me/export', schema: personalDataSchema }),
    }),
    deleteAccount: build.mutation<void, { password: string }>({
      query: (body) => ({ url: '/users/me', method: 'DELETE', body }),
    }),
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
  useLazyPersonalDataQuery,
  useDeleteAccountMutation,
} = usersApi;
