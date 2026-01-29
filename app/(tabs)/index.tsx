import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Welcome to FBLA Connect</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Alex!</ThemedText>
      </View>

      <View style={styles.avatarContainer} pointerEvents="none">
        <View style={styles.avatar}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.avatarImage}
            contentFit="contain"
          />
        </View>
      </View>

      <ThemedView style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.bellCircle}>
          <ThemedText style={styles.bellEmoji} lightColor="black" darkColor="black">🔔</ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.cardTitle} lightColor="black" darkColor="black">
            Recent Notifications
          </ThemedText>
        </View>

        <View style={styles.notificationList}>
          <View style={styles.notificationItem}>
            <View style={styles.iconCircleBlue}>
              <ThemedText style={styles.iconEmoji} lightColor="black" darkColor="black">📅</ThemedText>
            </View>
            <View style={styles.notificationText}>
              <ThemedText type="defaultSemiBold" lightColor="black" darkColor="black">Regional Competition Reminder</ThemedText>
              <ThemedText style={styles.notificationSub} lightColor="black" darkColor="black">Regional Leadership Conference is in 5 days - March 15th</ThemedText>
            </View>
            <ThemedText style={styles.notificationTime} lightColor="black" darkColor="black">2h ago</ThemedText>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.iconCircleYellow}>
              <ThemedText style={styles.iconEmoji} lightColor="black" darkColor="black">💲</ThemedText>
            </View>
            <View style={styles.notificationText}>
              <ThemedText type="defaultSemiBold" lightColor="black" darkColor="black">Dues Payment Reminder</ThemedText>
              <ThemedText style={styles.notificationSub} lightColor="black" darkColor="black">State dues payment of $25 is due by March 10th</ThemedText>
            </View>
            <ThemedText style={styles.notificationTime} lightColor="black" darkColor="black">1d ago</ThemedText>
          </View>
        </View>
      </ThemedView>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#f2f6fb',
  },
  header: {
    height: 220,
    backgroundColor: '#0b4f86',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
    zIndex: 10,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 6,
    borderColor: 'white',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00000010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellEmoji: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  notificationList: {
    marginTop: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbfdff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  iconCircleBlue: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dff0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleYellow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff6db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 20,
  },
  notificationText: {
    flex: 1,
  },
  notificationSub: {
    color: '#191a1bff',
    marginTop: 4,
    fontSize: 13,
  },
  notificationTime: {
    color: '#191a1bff',
    fontSize: 12,
    marginLeft: 8,
  },
});
