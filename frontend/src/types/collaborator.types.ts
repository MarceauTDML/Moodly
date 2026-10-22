export interface Collaborator {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'COLLABORATEUR';
  companyId: string;
  createdAt: string;
  status: 'PENDING' | 'ACTIVE';
  invitationSentAt: string | null;
  memberships: { isLead: boolean; team: { id: string; name: string } }[];
}
export interface CollaboratorInput {
  firstName: string;
  lastName: string;
  email: string;
  teamId: string;
}
export interface InvitationResult {
  message: string;
  delivery: 'EMAIL' | 'MANUAL';
  expiresAt: string;
  activationUrl?: string;
}
