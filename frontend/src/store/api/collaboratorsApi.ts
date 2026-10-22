import { baseApi } from './baseApi';
import { collaboratorSchema, invitationSchema } from '../../services/collaborator.schemas';
import type {
  Collaborator,
  CollaboratorInput,
  InvitationResult,
} from '../../types/collaborator.types';
export const collaboratorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    collaborators: build.query<Collaborator[], void>({
      query: () => ({ url: '/users/collaborators', schema: collaboratorSchema.array() }),
      providesTags: ['Collaborators'],
    }),
    collaborator: build.query<Collaborator, string>({
      query: (id) => ({ url: `/users/collaborators/${id}`, schema: collaboratorSchema }),
      providesTags: ['Collaborators'],
    }),
    createCollaborator: build.mutation<Collaborator, CollaboratorInput>({
      query: (body) => ({
        url: '/users/collaborators',
        method: 'POST',
        body,
        schema: collaboratorSchema,
      }),
      invalidatesTags: ['Collaborators', 'Teams'],
    }),
    updateCollaborator: build.mutation<Collaborator, { id: string; data: CollaboratorInput }>({
      query: ({ id, data }) => ({
        url: `/users/collaborators/${id}`,
        method: 'PATCH',
        body: data,
        schema: collaboratorSchema,
      }),
      invalidatesTags: ['Collaborators', 'Teams'],
    }),
    inviteCollaborator: build.mutation<InvitationResult, string>({
      query: (id) => ({
        url: `/users/collaborators/${id}/invite`,
        method: 'POST',
        schema: invitationSchema,
      }),
      invalidatesTags: ['Collaborators'],
    }),
  }),
});
export const {
  useCollaboratorsQuery,
  useCollaboratorQuery,
  useCreateCollaboratorMutation,
  useUpdateCollaboratorMutation,
  useInviteCollaboratorMutation,
} = collaboratorsApi;
