export type Role = 'MANAGER' | 'ADMIN' | 'COLLABORATEUR';
export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}
export interface Profile extends SessionUser {
  firstName: string;
  lastName: string;
  companyId: string;
  createdAt: string;
  company: { id: string; name: string } | null;
  teams: { id: string; name: string; isLead: boolean }[];
}
export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushEnabled: boolean;
}
// Export RGPD renvoyé par GET /users/me/export.
export interface PersonalData {
  exportedAt: string;
  account: { email: string; [key: string]: unknown };
  [key: string]: unknown;
}
