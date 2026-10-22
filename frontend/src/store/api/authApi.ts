import { baseApi } from './baseApi';
import { loginSchema } from '../../services/api.schemas';
import type { LoginInput, LoginResponse } from '../../types/auth.types';
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginInput>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
        public: true,
        schema: loginSchema,
      }),
    }),
    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/password/forgot', method: 'POST', body, public: true }),
    }),
    resetPassword: build.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: '/password/reset', method: 'POST', body, public: true }),
    }),
  }),
});
export const { useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation } = authApi;
