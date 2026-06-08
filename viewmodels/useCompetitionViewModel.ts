import { useMemo } from 'react';
import { CompetitionEvent, getCompetitionEventByCode, normalizeCompetitionCode } from '@/models/competitionModel';

const parseTimeForToday = (timeLabel: string) => {
  const now = new Date();
  const [timePart, meridiemRaw] = timeLabel.split(' ');
  const meridiem = meridiemRaw?.toUpperCase();
  const [h, m] = timePart.split(':').map(Number);
  let hours = h;
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, m || 0, 0, 0);
};

export function useCompetitionViewModel(rawCode: string) {
  const code = useMemo(() => normalizeCompetitionCode(rawCode), [rawCode]);
  const event: CompetitionEvent | null = useMemo(() => getCompetitionEventByCode(code), [code]);
  const currentTimeLabel = useMemo(
    () =>
      new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    [],
  );

  const nextUpcomingIndex = useMemo(() => {
    if (!event) return -1;
    const now = new Date();
    return event.schedule.findIndex((slot) => parseTimeForToday(slot.time).getTime() >= now.getTime());
  }, [event]);

  return {
    code,
    event,
    currentTimeLabel,
    nextUpcomingIndex,
  };
}
