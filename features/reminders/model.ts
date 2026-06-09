import { AllReminders, CalendarType, Reminder, emptyReminders, getCurrentUser, setCurrentUserReminders } from '@/lib/authStorage';
import { scheduleReminderNotificationsForUser } from '@/lib/notifications';

const FBLA_BLUE = '#003DA5';

export type ReminderFormData = { title: string; notes: string };

export const loadCurrentUserReminders = async (): Promise<AllReminders> => {
  const user = await getCurrentUser();
  return user?.reminders ?? emptyReminders();
};

export const persistCurrentUserReminders = async (reminders: AllReminders) => {
  await setCurrentUserReminders(reminders);
  const user = await getCurrentUser();
  if (user) {
    await scheduleReminderNotificationsForUser(user.username, reminders);
  }
};

export const getRemindersForTypeAndDate = (
  allReminders: AllReminders,
  selectedType: CalendarType,
  selectedDate: string,
): Reminder[] => {
  const currentReminders = allReminders[selectedType] || {};
  return currentReminders[selectedDate] || [];
};

export const buildMarkedDates = (allReminders: AllReminders, selectedType: CalendarType, selectedDate: string) => {
  const currentReminders = allReminders[selectedType] || {};
  const marks: Record<string, any> = {};

  Object.keys(currentReminders).forEach((date) => {
    marks[date] = { marked: true, dotColor: FBLA_BLUE, activeOpacity: 0.7 };
  });

  if (selectedDate) {
    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      selected: true,
      selectedColor: FBLA_BLUE,
    };
  }

  return marks;
};

export const buildUpdatedRemindersAfterSave = (
  allReminders: AllReminders,
  selectedType: CalendarType,
  selectedDate: string,
  currentDayReminders: Reminder[],
  formData: ReminderFormData,
): AllReminders => {
  const title = formData.title.trim();
  const notes = formData.notes.trim();
  const newReminder: Reminder = {
    id: Date.now().toString(),
    title,
    notes,
  };

  return {
    ...allReminders,
    [selectedType]: {
      ...(allReminders[selectedType] || {}),
      [selectedDate]: [...currentDayReminders, newReminder],
    },
  };
};

export const buildUpdatedRemindersAfterDelete = (
  allReminders: AllReminders,
  selectedType: CalendarType,
  selectedDate: string,
  reminderId: string,
): AllReminders => {
  const currentTypeMap = { ...(allReminders[selectedType] || {}) };
  const dayReminders = currentTypeMap[selectedDate] || [];
  const filtered = dayReminders.filter((item) => item.id !== reminderId);

  if (filtered.length === 0) {
    delete currentTypeMap[selectedDate];
  } else {
    currentTypeMap[selectedDate] = filtered;
  }

  return { ...allReminders, [selectedType]: currentTypeMap };
};
