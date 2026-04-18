import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ConversationSummary } from '@/lib/authStorage';

const FBLA_BLUE = '#003DA5';

type ConversationCardProps = {
  item: ConversationSummary;
  onPress: () => void;
};

const formatLastSeen = (isoDate: string) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function ConversationCard({ item, onPress }: ConversationCardProps) {
  return (
    <TouchableOpacity style={styles.conversationCard} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.otherDisplayName.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.conversationName}>{item.otherDisplayName}</Text>
        <Text style={styles.chapterText}>{item.otherChapterName}</Text>
        <Text style={styles.previewText} numberOfLines={1}>
          {item.lastMessageText}
        </Text>
      </View>
      <Text style={styles.dateText}>{formatLastSeen(item.lastMessageAt)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  conversationCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: FBLA_BLUE, fontSize: 16, fontWeight: '800' },
  body: { flex: 1 },
  conversationName: { color: '#0F172A', fontSize: 15, fontWeight: '800' },
  chapterText: { color: '#64748B', fontSize: 12, marginTop: 2 },
  previewText: { color: '#4B5B85', fontSize: 13, marginTop: 3 },
  dateText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
});
