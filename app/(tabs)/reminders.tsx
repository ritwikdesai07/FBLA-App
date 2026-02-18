import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Constants ---
const STORAGE_KEY = '@fbla_reminders_v2';
const { height } = Dimensions.get('window');

// --- Types ---
type Reminder = { id: string; title: string; notes: string };
type ReminderMap = Record<string, Reminder[]>;
type CalendarType = 'FBLA National' | 'FBLA State' | 'FBLA Regional';

// --- Color Scheme ---
const colors = {
  background: '#fff',
  primary: '#007AFF',
  accent: '#FF9500',
  text: '#000',
  textSecondary: '#888',
  border: '#ddd',
  surface: '#f5f5f5',
  card: '#fff',
  error: '#FF3B30',
};

const RemindersScreen = () => {
  // --- State ---
  const [selectedType, setSelectedType] = useState<CalendarType>('FBLA National');
  const [allReminders, setAllReminders] = useState<Record<CalendarType, ReminderMap>>({
    'FBLA National': {},
    'FBLA State': {},
    'FBLA Regional': {},
  });
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({ title: '', notes: '' });

  // --- Persistence ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setAllReminders(JSON.parse(stored));
      } catch (e) {
        console.error("Load Error", e);
      }
    };
    loadData();
  }, []);

  const persistData = async (newData: typeof allReminders) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      Alert.alert("Error", "Failed to save changes.");
    }
  };

  // --- Helpers ---
  const currentReminders = useMemo(() => allReminders[selectedType], [allReminders, selectedType]);
  const dayReminders = currentReminders[selectedDate] || [];

  const markedDates = useMemo(() => {
    const marks: any = {};
    Object.keys(currentReminders).forEach((date) => {
      marks[date] = { marked: true, dotColor: colors.primary, activeOpacity: 0.7 };
    });
    if (selectedDate) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: colors.accent };
    }
    return marks;
  }, [currentReminders, selectedDate, colors]);

  // --- Actions ---
  const handleSave = () => {
    if (!formData.title.trim()) return Alert.alert('Required', 'Please enter a title');

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      notes: formData.notes.trim(),
    };

    const updatedState = {
      ...allReminders,
      [selectedType]: {
        ...currentReminders,
        [selectedDate]: [...dayReminders, newReminder],
      },
    };

    setAllReminders(updatedState);
    persistData(updatedState);
    setFormData({ title: '', notes: '' });
    setIsAddMode(false);
  };

  const handleDelete = (id: string) => {
    const filtered = dayReminders.filter(r => r.id !== id);
    const updatedTypeMap = { ...currentReminders };
    
    if (filtered.length === 0) delete updatedTypeMap[selectedDate];
    else updatedTypeMap[selectedDate] = filtered;

    const updatedState = { ...allReminders, [selectedType]: updatedTypeMap };
    setAllReminders(updatedState);
    persistData(updatedState);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FBLA Reminders</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedType}
          onValueChange={(val) => setSelectedType(val as CalendarType)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor={colors.text}
        >
          <Picker.Item label="FBLA National" value="FBLA National" color={colors.text} />
          <Picker.Item label="FBLA State" value="FBLA State" color={colors.text} />
          <Picker.Item label="FBLA Regional" value="FBLA Regional" color={colors.text} />
        </Picker>
      </View>

      <Calendar
        theme={{
          calendarBackground: colors.background,
          textSectionTitleColor: colors.text,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.background,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary,
          arrowColor: colors.primary,
          dotColor: colors.primary,
          monthTextColor: colors.text,
        }}
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setIsAddMode(false);
          setModalVisible(true);
        }}
        onDayLongPress={(day) => {
          setSelectedDate(day.dateString);
          setIsAddMode(true);
          setModalVisible(true);
        }}
      />

      {/* Event Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isAddMode ? `New: ${selectedDate}` : `Events: ${selectedDate}`}
            </Text>

            {isAddMode ? (
              <View>
                <TextInput
                  placeholder="Title"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(t) => setFormData({ ...formData, title: t })}
                />
                <TextInput
                  placeholder="Notes (Optional)"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, styles.notesInput]}
                  multiline
                  value={formData.notes}
                  onChangeText={(t) => setFormData({ ...formData, notes: t })}
                />
                <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
                  <Text style={styles.btnText}>Save Reminder</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsAddMode(false)}>
                  <Text style={styles.btnCancelText}>Back to List</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={dayReminders}
                  keyExtractor={(item) => item.id}
                  ListEmptyComponent={<Text style={styles.emptyText}>No events scheduled.</Text>}
                  renderItem={({ item }) => (
                    <View style={styles.reminderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Text style={styles.deleteBtn}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <TouchableOpacity 
                  style={styles.btnPrimary} 
                  onPress={() => setIsAddMode(true)}
                >
                  <Text style={styles.btnText}>Add New Event</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              style={styles.btnClose} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  picker: {
    height: 50,
    width: '100%',
    color: colors.text,
  },
  pickerItem: {
    height: 48,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  calendar: { width: '100%', marginTop: 8 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    width: '92%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    maxHeight: height * 0.8,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  input: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 10,
    color: colors.text,
    backgroundColor: colors.background,
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  btnPrimary: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: '700' },
  btnCancelText: { textAlign: 'center', color: colors.textSecondary, marginTop: 12 },
  btnClose: { marginTop: 10, alignItems: 'center' },
  btnCloseText: { color: colors.text, fontWeight: '600' },
  deleteBtn: { color: colors.error, fontWeight: '600', paddingHorizontal: 8 },
  reminderRow: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderColor: colors.border, 
    alignItems: 'center' 
  },
  itemTitle: { fontWeight: '700', fontSize: 16, color: colors.text },
  itemNotes: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  emptyText: { textAlign: 'center', padding: 20, color: colors.textSecondary },
});

export default RemindersScreen;
