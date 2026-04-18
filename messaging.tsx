import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

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
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>CHAT</Text>
        <Text style={styles.heroTitle}>Messaging</Text>
      </View>

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
              <TouchableOpacity
                style={styles.memberRow}
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
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  hero: { backgroundColor: FBLA_BLUE, paddingHorizontal: 16, paddingVertical: 16 },
  heroEyebrow: { color: '#D6E3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
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
  modalContainer: { flex: 1, backgroundColor: BG },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EDFF',
  },
  modalTitle: { color: FBLA_BLUE, fontSize: 19, fontWeight: '800' },
  closeText: { color: '#5B6A8F', fontWeight: '700' },
  searchInput: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#DCE6FF',
    borderRadius: 11,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
  },
  memberRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 12,
    padding: 12,
  },
  memberName: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  memberChapter: { color: '#5B6A8F', marginTop: 3, fontSize: 12 },
});
