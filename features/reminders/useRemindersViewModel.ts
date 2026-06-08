import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AllReminders, CalendarType, emptyReminders } from '@/lib/authStorage';
import {
  ReminderFormData,
  buildMarkedDates,
  buildUpdatedRemindersAfterDelete,
  buildUpdatedRemindersAfterSave,
  getRemindersForTypeAndDate,
  loadCurrentUserReminders,
  persistCurrentUserReminders,
} from './model';

export function useRemindersViewModel() {
  const [selectedType, setSelectedType] = useState<CalendarType>('FBLA National');
  const [allReminders, setAllReminders] = useState<AllReminders>(emptyReminders());
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState<ReminderFormData>({ title: '', notes: '' });

  const loadReminders = useCallback(async () => {
    const reminders = await loadCurrentUserReminders();
    setAllReminders(reminders);
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [loadReminders])
  );

  const dayReminders = useMemo(
    () => getRemindersForTypeAndDate(allReminders, selectedType, selectedDate),
    [allReminders, selectedType, selectedDate],
  );

  const markedDates = useMemo(
    () => buildMarkedDates(allReminders, selectedType, selectedDate),
    [allReminders, selectedType, selectedDate],
  );

  const saveReminder = () => {
    if (!selectedDate) {
      Alert.alert('Choose a date', 'Select a date on the calendar first.');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Missing title', 'Please add a reminder title.');
      return;
    }

    const updatedState = buildUpdatedRemindersAfterSave(
      allReminders,
      selectedType,
      selectedDate,
      dayReminders,
      formData,
    );

    setAllReminders(updatedState);
    void persistCurrentUserReminders(updatedState);
    setFormData({ title: '', notes: '' });
    setIsAddMode(false);
  };

  const deleteReminder = (id: string) => {
    const updatedState = buildUpdatedRemindersAfterDelete(allReminders, selectedType, selectedDate, id);
    setAllReminders(updatedState);
    void persistCurrentUserReminders(updatedState);
  };

  const openDateInListMode = (dateString: string) => {
    setSelectedDate(dateString);
    setIsAddMode(false);
    setModalVisible(true);
  };

  const openDateInAddMode = (dateString: string) => {
    setSelectedDate(dateString);
    setIsAddMode(true);
    setModalVisible(true);
  };

  return {
    selectedType,
    setSelectedType,
    modalVisible,
    setModalVisible,
    isAddMode,
    setIsAddMode,
    selectedDate,
    formData,
    setFormData,
    dayReminders,
    markedDates,
    saveReminder,
    deleteReminder,
    openDateInListMode,
    openDateInAddMode,
  };
}
