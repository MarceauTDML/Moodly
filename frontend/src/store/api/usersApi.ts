import { baseApi } from './baseApi';
import {
  profileSchema,
  notificationsSchema,
  teamsSchema,
  personalDataSchema,
  twoFactorStatusSchema,
  twoFactorSetupSchema,
  twoFactorConfirmSchema,
} from '../../services/api.schemas';
import type { NotificationSettings, PersonalData, Profile } from '../../types/user.types';
import type { Team } from '../../types/team.types';
import type {
  TwoFactorConfirmation,
  TwoFactorMethod,
  TwoFactorSetup,
  TwoFactorStatus,
} from '../../types/auth.types';
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
    registerPush: build.mutation<NotificationSettings, { pushToken: string }>({
      query: (body) => ({
        url: '/users/me/push-token',
        method: 'PUT',
        body,
        schema: notificationsSchema,
      }),
      invalidatesTags: ['Notifications'],
    }),
    unregisterPush: build.mutation<void, { pushToken: string }>({
      query: (body) => ({ url: '/users/me/push-token', method: 'DELETE', body }),
      invalidatesTags: ['Notifications'],
    }),
    twoFactorStatus: build.query<TwoFactorStatus, void>({
      query: () => ({ url: '/users/me/2fa', schema: twoFactorStatusSchema }),
      providesTags: ['TwoFactor'],
    }),
    setupTwoFactor: build.mutation<TwoFactorSetup, { method: TwoFactorMethod }>({
      query: (body) => ({
        url: '/users/me/2fa/setup',
        method: 'POST',
        body,
        schema: twoFactorSetupSchema,
      }),
    }),
    confirmTwoFactor: build.mutation<TwoFactorConfirmation, { code: string }>({
      query: (body) => ({
        url: '/users/me/2fa/confirm',
        method: 'POST',
        body,
        schema: twoFactorConfirmSchema,
      }),
      invalidatesTags: ['TwoFactor'],
    }),
    disableTwoFactor: build.mutation<void, { password: string }>({
      query: (body) => ({ url: '/users/me/2fa', method: 'DELETE', body }),
      invalidatesTags: ['TwoFactor'],
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
  useRegisterPushMutation,
  useUnregisterPushMutation,
  useTwoFactorStatusQuery,
  useSetupTwoFactorMutation,
  useConfirmTwoFactorMutation,
  useDisableTwoFactorMutation,
} = usersApi;
