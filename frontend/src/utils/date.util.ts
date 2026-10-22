export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(iso),
  );
export const formatPeriod = (from: string, to: string) => `${formatDate(from)} – ${formatDate(to)}`;
