import type { NavigatorScreenParams } from '@react-navigation/native';
export type ManagerTabsParamList = {
  MoodMap: undefined;
  Evolution: undefined;
  Settings: undefined;
};
export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  Manager: NavigatorScreenParams<ManagerTabsParamList> | undefined;
  TeamTrends: undefined;
  Profile: undefined;
  Notifications: undefined;
};
