import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ChatMessage, ConversationDetail, getConversationWithUser, getCurrentUser, sendMessageToUser } from '@/lib/authStorage';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground } from '@/components/liquid-glass';

const FBLA_BLUE = FBLATheme.blue;

export default function ConversationScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const params = useLocalSearchParams<{ username?: string }>();
  const usernameParam = useMemo(() => {
    const raw = params.username;
    if (!raw) return '';
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.username]);

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!usernameParam) return;

      try {
        const [detail, currentUser] = await Promise.all([
          getConversationWithUser(usernameParam),
          getCurrentUser(),
        ]);
        setConversation(detail);
        setCurrentUsername(currentUser?.username ?? '');
      } catch (err) {
        const error = err as Error;
        Alert.alert('Messaging error', error.message);
        router.replace('/(tabs)/messaging');
      }
    };

    load();
    const interval = setInterval(load, 1000);
    return () => clearInterval(interval);
  }, [router, usernameParam]);

  const handleSend = async () => {
    if (!conversation) return;
    try {
      await sendMessageToUser(conversation.otherUsername, draft);
      setDraft('');
      const updated = await getConversationWithUser(conversation.otherUsername);
      setConversation(updated);
    } catch (err) {
      const error = err as Error;
      Alert.alert('Unable to send', error.message);
    }
  };

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <FrostedPanel style={styles.header} contentStyle={styles.headerInner}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/messaging')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={FBLA_BLUE} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{conversation?.otherDisplayName || 'Conversation'}</Text>
          <Text style={styles.headerChapter}>{conversation?.otherChapterName || ''}</Text>
        </View>
      </FrostedPanel>

      <FlatList
        data={conversation?.messages ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: tabBarHeight + 148 }]}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet. Start the conversation below.</Text>}
        renderItem={({ item }) => <MessageBubble message={item} isMe={item.senderUsername === currentUsername} />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={tabBarHeight}
        style={[styles.composerDock, { paddingBottom: tabBarHeight + 52 }]}>
        <FrostedPanel style={styles.composeRow} contentStyle={styles.composeInner}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor="#7281A8"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <MaterialIcons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </FrostedPanel>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </LiquidBackground>
  );
}

function MessageBubble({ message, isMe }: { message: ChatMessage; isMe: boolean }) {
  return (
    <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
      <Text style={[styles.bubbleText, isMe ? styles.myBubbleText : styles.theirBubbleText]}>{message.text}</Text>
      <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
        {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    margin: 12,
    borderRadius: FBLATheme.radius.lg,
  },
  headerInner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FBLATheme.surfaceSoft,
    marginRight: 10,
  },
  headerName: { color: FBLATheme.ink, fontWeight: '800', fontSize: 16 },
  headerChapter: { color: FBLATheme.muted, fontSize: 12, marginTop: 2 },
  messagesContent: { padding: 14, gap: 8, paddingBottom: 18 },
  emptyText: { textAlign: 'center', color: '#5B6A8F', marginTop: 24 },
  bubble: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myBubble: { alignSelf: 'flex-end', backgroundColor: FBLA_BLUE },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.66)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)' },
  bubbleText: { fontSize: 14, fontWeight: '600' },
  myBubbleText: { color: '#fff' },
  theirBubbleText: { color: FBLATheme.ink },
  timeText: { marginTop: 4, fontSize: 10, fontWeight: '700' },
  myTimeText: { color: '#C7D4FF', textAlign: 'right' },
  theirTimeText: { color: '#6A7AA6' },
  composerDock: {
    paddingHorizontal: 12,
  },
  composeRow: {
    borderRadius: FBLATheme.radius.lg,
  },
  composeInner: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: FBLATheme.ink,
    backgroundColor: FBLATheme.surfaceSoft,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: FBLA_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
