import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '@/lib/authStorage';

export type PracticeQuizEvent = {
  name: string;
  pdfPath: string;
  pdfUri: string | null;
  hasPdf: boolean;
};

const QUIZ_PREF_KEY_PREFIX = '@fbla_practice_quiz_prefs_v1_';
const AVAILABLE_QUIZ_EVENTS = new Set<string>(['Accounting', 'Business Ethics']);

export const PRACTICE_QUIZ_EVENTS: PracticeQuizEvent[] = [
  'Accounting',
  'Advanced Accounting',
  'Advertising',
  'Agribusiness',
  'Banking & Financial Systems',
  'Business Communication',
  'Business Ethics',
  'Business Law',
  'Business Management',
  'Computer Problem Solving',
  'Cybersecurity',
  'Data Science & AI',
  'Economics',
  'Entrepreneurship',
  'Future Business Leader',
  'Global Business',
  'Help Desk',
  'Introduction to Business Concepts',
  'Introduction to Financial Math',
  'Introduction to Information Technology',
  'Introduction to Marketing Concepts',
  'Networking Infrastructures',
  'Organizational Leadership',
  'Marketing',
  'Personal Finance',
  'Project Management',
  'Public Policy & Advocacy',
  'Securities & Investments',
  'Sports & Entertainment Management',
  'Technology Support Services',
].map((eventName) => ({
  name: eventName,
  pdfPath: `assets/tests/${eventName} Sample Questions.pdf`,
  pdfUri: null,
  hasPdf: AVAILABLE_QUIZ_EVENTS.has(eventName),
}));

export type PracticeQuizPrefs = {
  favorites: string[];
  lastOpenedEvent: string | null;
};

const getPrefsStorageKey = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return `${QUIZ_PREF_KEY_PREFIX}guest`;
  }

  return `${QUIZ_PREF_KEY_PREFIX}${user.username}`;
};

export const loadPracticeQuizEvents = async () => PRACTICE_QUIZ_EVENTS;

export const getPracticeQuizEventByName = async (eventName: string) =>
  PRACTICE_QUIZ_EVENTS.find((event) => event.name === eventName) ?? null;

export const loadPracticeQuizPrefs = async (): Promise<PracticeQuizPrefs> => {
  const key = await getPrefsStorageKey();
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return { favorites: [], lastOpenedEvent: null };
  }

  try {
    const parsed = JSON.parse(raw) as PracticeQuizPrefs;
    return {
      favorites: parsed.favorites ?? [],
      lastOpenedEvent: parsed.lastOpenedEvent ?? null,
    };
  } catch {
    return { favorites: [], lastOpenedEvent: null };
  }
};

export const persistPracticeQuizPrefs = async (prefs: PracticeQuizPrefs) => {
  const key = await getPrefsStorageKey();
  await AsyncStorage.setItem(key, JSON.stringify(prefs));
};
