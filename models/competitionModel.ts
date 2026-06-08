export type PresentationSlot = {
  time: string;
  competitorName: string;
  roomNumber: string;
};

export type CompetitionEvent = {
  code: string;
  eventName: string;
  schedule: PresentationSlot[];
};

export const COMPETITION_EVENTS_BY_CODE: Record<string, CompetitionEvent> = {
  MAD123: {
    code: 'MAD123',
    eventName: 'Mobile Application Development',
    schedule: [
      { time: '9:00 AM', competitorName: 'Alex Johnson', roomNumber: 'Room B201' },
      { time: '9:15 AM', competitorName: 'Sarah Kim', roomNumber: 'Room B203' },
      { time: '9:30 AM', competitorName: 'Daniel Garcia', roomNumber: 'Room B205' },
      { time: '9:45 AM', competitorName: 'Emily Chen', roomNumber: 'Room B207' },
      { time: '10:00 AM', competitorName: 'Michael Patel', roomNumber: 'Room B209' },
      { time: '10:15 AM', competitorName: 'Olivia Brown', roomNumber: 'Room B211' },
      { time: '10:30 AM', competitorName: 'Ethan Davis', roomNumber: 'Room B213' },
      { time: '10:45 AM', competitorName: 'Sophia Martinez', roomNumber: 'Room B215' },
    ],
  },
  CYB456: {
    code: 'CYB456',
    eventName: 'Cybersecurity',
    schedule: [
      { time: '8:30 AM', competitorName: 'Liam Thompson', roomNumber: 'Room C102' },
      { time: '8:45 AM', competitorName: 'Ava Rodriguez', roomNumber: 'Room C104' },
      { time: '9:00 AM', competitorName: 'Noah Wilson', roomNumber: 'Room C106' },
      { time: '9:15 AM', competitorName: 'Isabella Moore', roomNumber: 'Room C108' },
      { time: '9:30 AM', competitorName: 'Mason Taylor', roomNumber: 'Room C110' },
      { time: '9:45 AM', competitorName: 'Mia Anderson', roomNumber: 'Room C112' },
      { time: '10:00 AM', competitorName: 'Lucas Thomas', roomNumber: 'Room C114' },
    ],
  },
  ENT789: {
    code: 'ENT789',
    eventName: 'Entrepreneurship',
    schedule: [
      { time: '11:00 AM', competitorName: 'Harper Clark', roomNumber: 'Room A301' },
      { time: '11:15 AM', competitorName: 'Benjamin Lewis', roomNumber: 'Room A303' },
      { time: '11:30 AM', competitorName: 'Amelia Walker', roomNumber: 'Room A305' },
      { time: '11:45 AM', competitorName: 'Elijah Hall', roomNumber: 'Room A307' },
      { time: '12:00 PM', competitorName: 'Charlotte Allen', roomNumber: 'Room A309' },
    ],
  },
  DAT321: {
    code: 'DAT321',
    eventName: 'Data Science & AI',
    schedule: [
      { time: '1:00 PM', competitorName: 'James Young', roomNumber: 'Room D201' },
      { time: '1:15 PM', competitorName: 'Evelyn Hernandez', roomNumber: 'Room D203' },
      { time: '1:30 PM', competitorName: 'Alexander King', roomNumber: 'Room D205' },
      { time: '1:45 PM', competitorName: 'Abigail Wright', roomNumber: 'Room D207' },
      { time: '2:00 PM', competitorName: 'Henry Lopez', roomNumber: 'Room D209' },
    ],
  },
  NET654: {
    code: 'NET654',
    eventName: 'Networking Infrastructures',
    schedule: [
      { time: '9:00 AM', competitorName: 'Sebastian Scott', roomNumber: 'Room N101' },
      { time: '9:20 AM', competitorName: 'Ella Green', roomNumber: 'Room N103' },
      { time: '9:40 AM', competitorName: 'Jack Adams', roomNumber: 'Room N105' },
      { time: '10:00 AM', competitorName: 'Scarlett Baker', roomNumber: 'Room N107' },
      { time: '10:20 AM', competitorName: 'Aiden Gonzalez', roomNumber: 'Room N109' },
    ],
  },
  MKT987: {
    code: 'MKT987',
    eventName: 'Marketing',
    schedule: [
      { time: '8:45 AM', competitorName: 'Mateo Nelson', roomNumber: 'Room M201' },
      { time: '9:00 AM', competitorName: 'Grace Carter', roomNumber: 'Room M203' },
      { time: '9:15 AM', competitorName: 'Logan Mitchell', roomNumber: 'Room M205' },
      { time: '9:30 AM', competitorName: 'Lily Perez', roomNumber: 'Room M207' },
      { time: '9:45 AM', competitorName: 'Wyatt Roberts', roomNumber: 'Room M209' },
    ],
  },
  WINSLC: {
    code: 'WINSLC',
    eventName: 'NJ State Leadership Conference',
    schedule: [
      { time: '3:00 PM', competitorName: 'Avery Johnson', roomNumber: 'Room T101' },
      { time: '3:00 PM', competitorName: 'Noah Miller', roomNumber: 'Room T103' },
      { time: '3:00 PM', competitorName: 'Ella Nguyen', roomNumber: 'Room T105' },
      { time: '3:15 PM', competitorName: 'Liam Carter', roomNumber: 'Room T107' },
      { time: '3:15 PM', competitorName: 'Sophia Reed', roomNumber: 'Room T109' },
      { time: '3:15 PM', competitorName: 'Mason Lee', roomNumber: 'Room T111' },
      { time: '3:30 PM', competitorName: 'Isabella Flores', roomNumber: 'Room T113' },
      { time: '3:30 PM', competitorName: 'Ethan Brooks', roomNumber: 'Room T115' },
      { time: '3:30 PM', competitorName: 'Charlotte Kim', roomNumber: 'Room T117' },
      { time: '3:45 PM', competitorName: 'Lucas Adams', roomNumber: 'Room T119' },
      { time: '3:45 PM', competitorName: 'Amelia Patel', roomNumber: 'Room T121' },
      { time: '4:00 PM', competitorName: 'Benjamin Clark', roomNumber: 'Room T123' },
      { time: '4:00 PM', competitorName: 'Mia Thompson', roomNumber: 'Room T125' },
    ],
  },
};

export const normalizeCompetitionCode = (code: string) =>
  code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);

export const getCompetitionEventByCode = (code: string): CompetitionEvent | null => {
  const normalized = normalizeCompetitionCode(code);
  if (!normalized || normalized.length !== 6) return null;
  return COMPETITION_EVENTS_BY_CODE[normalized] ?? null;
};
