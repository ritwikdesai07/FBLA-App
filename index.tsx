import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CalendarType } from '@/lib/authStorage';
import { useRemindersViewModel } from '@/features/reminders/useRemindersViewModel';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

export default function RemindersScreen() {
  const [scopeMenuVisible, setScopeMenuVisible] = React.useState(false);
  const {
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
  } = useRemindersViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Reminders</Text>
          <Text style={styles.heroSubtitle}>Tap a date to view. Long press to add instantly.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Calendar scope</Text>
          <TouchableOpacity style={styles.scopeButton} activeOpacity={0.85} onPress={() => setScopeMenuVisible(true)}>
            <Text style={styles.scopeButtonText}>{selectedType}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={22} color="#5B6A8F" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarWrap}>
          <Calendar
            theme={{
              calendarBackground: '#fff',
              textSectionTitleColor: '#5B6A8F',
              selectedDayBackgroundColor: FBLA_BLUE,
              selectedDayTextColor: '#fff',
              todayTextColor: FBLA_BLUE,
              dayTextColor: '#0F172A',
              textDisabledColor: '#98A2B3',
              arrowColor: FBLA_BLUE,
              dotColor: FBLA_BLUE,
              monthTextColor: '#0F172A',
            }}
            markedDates={markedDates}
            onDayPress={(day) => openDateInListMode(day.dateString)}
            onDayLongPress={(day) => openDateInAddMode(day.dateString)}
          />
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isAddMode ? `Add Reminder` : `Reminders`}
            </Text>
            <Text style={styles.dateSubtitle}>{selectedDate}</Text>

            {isAddMode ? (
              <View>
                <TextInput 
                  placeholder="Reminder title"
                  placeholderTextColor="#8A94AD"
                  style={styles.input} 
                  value={formData.title}
                  onChangeText={(t) => setFormData({ ...formData, title: t })}
                />
                <TextInput 
                  placeholder="Notes (optional)" 
                  placeholderTextColor="#8A94AD"
                  style={[styles.input, styles.notesInput]} 
                  multiline 
                  value={formData.notes}
                  onChangeText={(t) => setFormData({ ...formData, notes: t })}
                />
                <TouchableOpacity style={styles.btnPrimary} onPress={saveReminder}>
                  <Text style={styles.btnText}>Save Reminder</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsAddMode(false)}>
                  <Text style={styles.btnAltText}>Back to list</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listContainer}>
                <FlatList
                  key={selectedDate}
                  data={dayReminders}
                  keyExtractor={(item) => item.id}
                  extraData={selectedDate}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={true}
                  ListEmptyComponent={<Text style={styles.emptyText}>No reminders for this date.</Text>}
                  renderItem={({ item }) => (
                    <View style={styles.reminderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
                      </View>
                      <TouchableOpacity onPress={() => deleteReminder(item.id)}>
                        <Text style={styles.deleteBtn}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsAddMode(true)}>
                  <Text style={styles.btnText}>+ Add New</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.btnClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={scopeMenuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.scopeMenuOverlay} activeOpacity={1} onPress={() => setScopeMenuVisible(false)}>
          <View style={styles.scopeMenuCard}>
            {(['FBLA National', 'FBLA State', 'FBLA Regional'] as CalendarType[]).map((scope) => {
              const active = selectedType === scope;
              return (
                <TouchableOpacity
                  key={scope}
                  style={[styles.scopeMenuItem, active && styles.scopeMenuItemActive]}
                  onPress={() => {
                    setSelectedType(scope);
                    setScopeMenuVisible(false);
                  }}>
                  <Text style={[styles.scopeMenuText, active && styles.scopeMenuTextActive]}>{scope}</Text>
                  {active ? <MaterialIcons name="check" size={18} color={FBLA_BLUE} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  hero: { 
    backgroundColor: FBLA_BLUE, 
    borderRadius: 14, 
    padding: 16, 
    marginTop: 10, 
    marginBottom: 10 
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroSubtitle: { color: '#D6E3FF', fontSize: 13, marginTop: 4 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 10, 
    elevation: 2 
  },
  label: { color: '#5B6A8F', fontWeight: '700', fontSize: 12, marginBottom: 6 },
  scopeButton: {
    borderWidth: 1, 
    borderColor: '#DCE6FF', 
    borderRadius: 10, 
    backgroundColor: '#F9FBFF',
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scopeButtonText: { color: '#0F172A', fontSize: 15, fontWeight: '600' },
  calendarWrap: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    overflow: 'hidden', 
    elevation: 10
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    maxHeight: '85%', // Slightly larger to give it breathing room
    flexShrink: 1,    // Ensures the modal respects the screen size
  },
  listContainer: { 
    flexShrink: 0,    // CRITICAL: This traps the FlatList inside the white box
    marginBottom: 20, // Gives a little space before the Add button
    paddingTop: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#000000' }, 
  dateSubtitle: { color: '#5B6A8F', marginBottom: 15 },
  input: { 
    borderWidth: 1, 
    borderColor: '#DCE6FF', 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 10, 
    backgroundColor: '#F9FBFF',
    color: '#000000' 
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  btnPrimary: { 
    backgroundColor: FBLA_BLUE, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnAltText: { textAlign: 'center', color: '#5B6A8F', marginTop: 15 },
  btnClose: { marginTop: 15, paddingBottom: 10, alignItems: 'center' },
  btnCloseText: { color: '#000000', fontWeight: '600' }, 
  reminderRow: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderColor: '#EEF2FF', 
    alignItems: 'center',
    width: '100%',
  },
  itemTitle: { 
    fontWeight: '700', 
    fontSize: 16, 
    color: '#000000' 
  },
  itemNotes: { 
    color: '#000000', 
    fontSize: 14,
    opacity: 0.8 
  },
  deleteBtn: { color: '#D92D20', fontWeight: '600', marginLeft: 10 },
  emptyText: { 
    textAlign: 'center', 
    marginVertical: 20, 
    color: '#000000' 
  },
  listContent: {
    flexGrow: 1,
    alignItems: 'stretch',
  },
  scopeMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scopeMenuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    overflow: 'hidden',
  },
  scopeMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  scopeMenuItemActive: { backgroundColor: '#EEF3FF' },
  scopeMenuText: { fontSize: 15, color: '#0F172A' },
  scopeMenuTextActive: { color: FBLA_BLUE, fontWeight: '700' },
});
