import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ConversationSummary } from '@/lib/authStorage';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel } from '@/components/liquid-glass';

const FBLA_BLUE = FBLATheme.blue;

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
    <FrostedPanel style={styles.conversationCard} contentStyle={styles.conversationInner}>
      <TouchableOpacity style={styles.pressableRow} activeOpacity={0.8} onPress={onPress}>
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
    </FrostedPanel>
  );
}

const styles = StyleSheet.create({
  conversationCard: {
    borderRadius: FBLATheme.radius.lg,
  },
  conversationInner: {
    padding: 0,
  },
  pressableRow: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: FBLATheme.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: FBLA_BLUE, fontSize: 16, fontWeight: '800' },
  body: { flex: 1 },
  conversationName: { color: FBLATheme.ink, fontSize: 15, fontWeight: '800' },
  chapterText: { color: FBLATheme.muted, fontSize: 12, marginTop: 2 },
  previewText: { color: FBLATheme.mutedStrong, fontSize: 13, marginTop: 3 },
  dateText: { color: FBLATheme.muted, fontSize: 11, fontWeight: '700' },
});
