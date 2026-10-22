import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  useMoodOptionsQuery,
  useTodayCheckinQuery,
  useSubmitMoodMutation,
} from '../store/api/moodsApi';
import { submitMoodInputSchema } from '../services/checkin.schemas';
import { errorMessage } from '../services/api.client';
import type { CheckinMood, CheckinTag, MoodSubmission } from '../types/checkin.types';

export function useDailyCheckin() {
  const options = useMoodOptionsQuery();
  const today = useTodayCheckinQuery(undefined, {
    pollingInterval: 60000,
    refetchOnMountOrArgChange: true,
  });
  const [send, mutation] = useSubmitMoodMutation();
  // Le brouillon reste dans ce composant : aucune persistance du mood ou du commentaire.
  const [mood, setMood] = useState<CheckinMood | null>(null);
  const [tags, setTags] = useState<CheckinTag[]>([]);
  const [comment, setComment] = useState('');
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<MoodSubmission | null>(null);
  const [submittedDate, setSubmittedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const sending = useRef(false);
  const previousDate = useRef<string | undefined>(undefined);
  const status = today.currentData;
  const submitted = Boolean(status && (status.hasSubmittedToday || status.date === submittedDate));

  const clearDraft = useCallback(() => {
    setMood(null);
    setTags([]);
    setComment('');
  }, []);
  useEffect(() => {
    if (!status) return;
    if (previousDate.current && previousDate.current !== status.date) {
      clearDraft();
      setTeamId('');
      setError('');
      setModalVisible(false);
      setConfirmation(null);
    }
    previousDate.current = status.date;
    if (status.hasSubmittedToday) clearDraft();
  }, [status, clearDraft]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void today.refetch();
    });
    return () => subscription.remove();
  }, [today.refetch]);

  const selectedTeamId = status?.teams.length === 1 ? status.teams[0]!.id : teamId;
  const canSubmit = Boolean(
    status?.canSubmit &&
    !submitted &&
    !today.isError &&
    !today.isFetching &&
    options.currentData &&
    !options.isError &&
    mood &&
    status.teams.some((team) => team.id === selectedTeamId) &&
    !submitting,
  );
  const toggleTag = (code: CheckinTag) =>
    setTags((current) =>
      current.includes(code) ? current.filter((tag) => tag !== code) : [...current, code],
    );
  const submit = async () => {
    if (sending.current || !canSubmit || !mood) return;
    const parsed = submitMoodInputSchema.safeParse({ mood, tags, comment, teamId: selectedTeamId });
    if (!parsed.success) {
      setError('Vérifie ton humeur, ton équipe et la longueur du commentaire.');
      return;
    }
    sending.current = true;
    setSubmitting(true);
    setError('');
    try {
      const result = await send(parsed.data).unwrap();
      setSubmittedDate(result.date);
      setConfirmation(result);
      setModalVisible(true);
      clearDraft();
    } catch (failure) {
      if (
        failure &&
        typeof failure === 'object' &&
        'code' in failure &&
        failure.code === 'ALREADY_SUBMITTED'
      ) {
        setSubmittedDate(status!.date);
        clearDraft();
      } else {
        setError(errorMessage(failure));
      }
      // Une réponse réseau perdue ne signifie pas que le serveur n'a rien enregistré.
      void today.refetch();
    } finally {
      mutation.reset();
      sending.current = false;
      setSubmitting(false);
    }
  };
  const refresh = () => Promise.all([options.refetch(), today.refetch()]);
  return {
    options,
    today,
    mood,
    setMood,
    tags,
    toggleTag,
    comment,
    setComment,
    teamId,
    setTeamId,
    submitted,
    canSubmit,
    submitting,
    error,
    confirmation,
    modalVisible,
    closeConfirmation: () => setModalVisible(false),
    submit,
    refresh,
  };
}
