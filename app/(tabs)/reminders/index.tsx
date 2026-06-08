import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CalendarType } from '@/lib/authStorage';
import { useRemindersViewModel } from '@/features/reminders/useRemindersViewModel';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const { blue: FBLA_BLUE, blueDark: FBLA_BLUE_DARK, yellow: FBLA_YELLOW } = FBLATheme;

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
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
          <Text style={styles.heroTitle}>Reminders</Text>
          <Text style={styles.heroSubtitle}>Plan chapter dates, competition deadlines, and regional prep.</Text>
        </LiquidGlass>

        <FrostedPanel style={styles.card} contentStyle={styles.cardInner}>
          <Text style={styles.label}>Calendar scope</Text>
          <TouchableOpacity style={styles.scopeButton} activeOpacity={0.85} onPress={() => setScopeMenuVisible(true)}>
            <Text style={styles.scopeButtonText}>{selectedType}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={22} color="#5B6A8F" />
          </TouchableOpacity>
        </FrostedPanel>

        <FrostedPanel style={styles.calendarWrap} contentStyle={styles.calendarInner}>
          <Calendar
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: FBLATheme.muted,
              selectedDayBackgroundColor: FBLA_BLUE,
              selectedDayTextColor: FBLATheme.white,
              todayTextColor: FBLA_BLUE,
              dayTextColor: FBLATheme.ink,
              textDisabledColor: '#98A2B3',
              arrowColor: FBLA_BLUE,
              dotColor: FBLA_YELLOW,
              monthTextColor: FBLATheme.ink,
            }}
            markedDates={markedDates}
            onDayPress={(day) => openDateInListMode(day.dateString)}
            onDayLongPress={(day) => openDateInAddMode(day.dateString)}
          />
        </FrostedPanel>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <FrostedPanel style={styles.modalContent} contentStyle={styles.modalInner}>
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
          </FrostedPanel>
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
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 96, gap: 12 },
  hero: { 
    borderRadius: FBLATheme.radius.xl, 
    marginTop: 10, 
  },
  heroInner: { padding: 20 },
  heroTitle: { color: FBLATheme.white, fontSize: 27, fontWeight: '900' },
  heroSubtitle: { color: '#DDE8FF', fontSize: 13, marginTop: 5, lineHeight: 19 },
  card: { 
    borderRadius: FBLATheme.radius.lg, 
  },
  cardInner: { padding: 14 },
  label: { color: FBLATheme.muted, fontWeight: '800', fontSize: 12, marginBottom: 6 },
  scopeButton: {
    borderWidth: 1, 
    borderColor: FBLATheme.line, 
    borderRadius: 12, 
    backgroundColor: FBLATheme.surfaceSoft,
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scopeButtonText: { color: FBLATheme.ink, fontSize: 15, fontWeight: '800' },
  calendarWrap: { 
    borderRadius: FBLATheme.radius.lg, 
  },
  calendarInner: { padding: 4 },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    borderTopLeftRadius: FBLATheme.radius.hero, 
    borderTopRightRadius: FBLATheme.radius.hero, 
    maxHeight: '85%',
    flexShrink: 1,
  },
  modalInner: { padding: 20 },
  listContainer: { 
    flexShrink: 0,
    marginBottom: 20,
    paddingTop: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: FBLATheme.ink }, 
  dateSubtitle: { color: FBLATheme.muted, marginBottom: 15, fontWeight: '700' },
  input: { 
    borderWidth: 1, 
    borderColor: FBLATheme.line, 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 10, 
    backgroundColor: FBLATheme.surfaceSoft,
    color: FBLATheme.ink 
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  btnPrimary: { 
    backgroundColor: FBLA_YELLOW, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  btnText: { color: FBLA_BLUE_DARK, fontWeight: '900', fontSize: 16 },
  btnAltText: { textAlign: 'center', color: FBLATheme.muted, marginTop: 15, fontWeight: '800' },
  btnClose: { marginTop: 15, paddingBottom: 10, alignItems: 'center' },
  btnCloseText: { color: FBLATheme.ink, fontWeight: '700' }, 
  reminderRow: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.7)', 
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  itemTitle: { 
    fontWeight: '700', 
    fontSize: 16, 
    color: FBLATheme.ink 
  },
  itemNotes: { 
    color: FBLATheme.muted, 
    fontSize: 14,
    opacity: 0.8 
  },
  deleteBtn: { color: FBLATheme.danger, fontWeight: '800', marginLeft: 10 },
  emptyText: { 
    textAlign: 'center', 
    marginVertical: 20, 
    color: FBLATheme.muted,
    fontWeight: '700',
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
    backgroundColor: FBLATheme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FBLATheme.line,
    overflow: 'hidden',
  },
  scopeMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3FF',
  },
  scopeMenuItemActive: { backgroundColor: FBLATheme.yellowSoft },
  scopeMenuText: { fontSize: 15, color: FBLATheme.ink },
  scopeMenuTextActive: { color: FBLA_BLUE, fontWeight: '700' },
});
