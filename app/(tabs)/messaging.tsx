import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import {
  ConversationSummary,
  MemberDirectoryItem,
  getAllMembersDirectory,
  getCurrentUserConversations,
} from '@/lib/authStorage';
import { ConversationCard } from '@/components/messaging/ConversationCard';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const FBLA_BLUE = FBLATheme.blue;

export default function MessagingScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [members, setMembers] = useState<MemberDirectoryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [conversationList, directory] = await Promise.all([
        getCurrentUserConversations(),
        getAllMembersDirectory(),
      ]);
      setConversations(conversationList);
      setMembers(directory);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const filteredMembers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return members;

    return members.filter((member) => {
      return (
        member.displayName.toLowerCase().includes(query) ||
        member.username.toLowerCase().includes(query) ||
        member.chapterName.toLowerCase().includes(query)
      );
    });
  }, [members, searchText]);

  if (loading) {
    return (
      <LiquidBackground>
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </SafeAreaView>
      </LiquidBackground>
    );
  }

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
        <Text style={styles.heroTitle}>Messaging</Text>
        <Text style={styles.heroSubtitle}>Keep chapter conversations easy to find and continue.</Text>
      </LiquidGlass>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 96 }]}
        ListEmptyComponent={<Text style={styles.emptyText}>No conversations yet. Tap + to start one.</Text>}
        renderItem={({ item }) => (
          <ConversationCard
            item={item}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/messages/[username]',
                params: { username: item.otherUsername },
              })
            }
          />
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: tabBarHeight + 20 }]}
        activeOpacity={0.85}
        onPress={() => setPickerOpen(true)}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={pickerOpen} animationType="slide">
        <LiquidBackground>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start Conversation</Text>
            <TouchableOpacity onPress={() => setPickerOpen(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search members"
            placeholderTextColor="#7B88AA"
            style={styles.searchInput}
          />

          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item.username}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No members found.</Text>}
            renderItem={({ item }) => (
              <FrostedPanel style={styles.memberRow} contentStyle={styles.memberRowInner}>
              <TouchableOpacity
                style={styles.memberPressable}
                activeOpacity={0.8}
                onPress={() => {
                  setPickerOpen(false);
                  setSearchText('');
                  router.push({
                    pathname: '/(tabs)/messages/[username]',
                    params: { username: item.username },
                  });
                }}>
                <Text style={styles.memberName}>{item.displayName}</Text>
                <Text style={styles.memberChapter}>{item.chapterName}</Text>
              </TouchableOpacity>
              </FrostedPanel>
            )}
          />
        </SafeAreaView>
        </LiquidBackground>
      </Modal>
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { margin: 14, borderRadius: FBLATheme.radius.xl },
  heroInner: { paddingHorizontal: 18, paddingVertical: 18 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  heroSubtitle: { color: '#DDE8FF', fontSize: 13, lineHeight: 19, marginTop: 5 },
  loadingText: { color: '#5B6A8F', textAlign: 'center', marginTop: 40, fontSize: 16, fontWeight: '600' },
  listContent: { padding: 16, gap: 10 },
  emptyText: { textAlign: 'center', color: '#5B6A8F', marginTop: 20 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FBLA_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#001D5D',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 20,
    minHeight: 104,
    backgroundColor: FBLATheme.surface,
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: FBLATheme.radius.lg,
    borderBottomRightRadius: FBLATheme.radius.lg,
    shadowColor: FBLATheme.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  modalTitle: { color: FBLA_BLUE, fontSize: 19, fontWeight: '800' },
  closeText: { color: '#5B6A8F', fontWeight: '700' },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderRadius: FBLATheme.radius.md,
    backgroundColor: FBLATheme.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
  },
  memberRow: {
    borderRadius: FBLATheme.radius.lg,
  },
  memberRowInner: {
    padding: 0,
  },
  memberPressable: {
    padding: 12,
  },
  memberName: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  memberChapter: { color: '#5B6A8F', marginTop: 3, fontSize: 12 },
});
