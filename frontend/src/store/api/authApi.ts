import { baseApi } from './baseApi';
import { loginResultSchema, loginSchema } from '../../services/api.schemas';
import type { LoginInput, LoginResponse, TwoFactorChallenge } from '../../types/auth.types';
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse | TwoFactorChallenge, LoginInput>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
        public: true,
        schema: loginResultSchema,
      }),
    }),
    verifyTwoFactor: build.mutation<LoginResponse, { challengeToken: string; code: string }>({
      query: (body) => ({
        url: '/auth/2fa/verify',
        method: 'POST',
        body,
        public: true,
        schema: loginSchema,
      }),
    }),
    resendTwoFactorCode: build.mutation<{ message: string }, { challengeToken: string }>({
      query: (body) => ({ url: '/auth/2fa/resend', method: 'POST', body, public: true }),
    }),
    activateAccount: build.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/activate', method: 'POST', body, public: true }),
    }),
    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/password/forgot', method: 'POST', body, public: true }),
    }),
    resetPassword: build.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: '/password/reset', method: 'POST', body, public: true }),
    }),
  }),
});
export const {
  useLoginMutation,
  useVerifyTwoFactorMutation,
  useResendTwoFactorCodeMutation,
  useActivateAccountMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
