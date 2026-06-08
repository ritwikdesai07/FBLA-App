import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { getCurrentUser, logoutUser, setCurrentUserProfile, UserRecord } from '@/lib/authStorage';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';
import {
  SocialMediaLinks,
  loadStoredSocialLinks,
  persistSocialLinks,
  searchChapterSocialLinks,
} from '@/features/social-media/socialMediaModel';

const { blue: FBLA_BLUE, blueDark: FBLA_BLUE_DARK, yellow: FBLA_YELLOW } = FBLATheme;

const safeText = (value?: string) => {
  const cleaned = value?.trim();
  return cleaned ? cleaned : 'Not set';
};

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialMediaLinks>({
    chapterName: '',
    instagramUrl: 'https://www.instagram.com/sb.fbla/?hl=en',
    tiktokUrl: null,
    instagramEmbedUrl: null,
  });
  const [duesModalOpen, setDuesModalOpen] = useState(false);
  const [duesToAdd, setDuesToAdd] = useState('');
  const [paidToAdd, setPaidToAdd] = useState('');

  const loadDashboardData = React.useCallback(async () => {
    const [current, links] = await Promise.all([getCurrentUser(), loadStoredSocialLinks()]);
    setUser(current);
    setSocialLinks(links);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  useEffect(() => {
    let active = true;

    const searchInBackground = async () => {
      const chapterName = user?.profile?.chapterName?.trim() || '';
      if (!chapterName) return;

      const currentLinks = await loadStoredSocialLinks();
      if (!active) return;

      const needsSearch =
        currentLinks.chapterName !== chapterName.toLowerCase() ||
        (!currentLinks.instagramUrl && !currentLinks.tiktokUrl);

      if (!needsSearch) {
        setSocialLinks(currentLinks);
        return;
      }

      const found = await searchChapterSocialLinks(chapterName);
      await persistSocialLinks(found);
      if (!active) return;
      setSocialLinks(found);
    };

    void searchInBackground();
    return () => {
      active = false;
    };
  }, [user?.profile?.chapterName]);

  const duesTotal = user?.profile?.duesTotal ?? 0;
  const duesPaid = user?.profile?.duesPaid ?? 0;
  const duesPercent = useMemo(() => {
    if (duesTotal <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((duesPaid / duesTotal) * 100)));
  }, [duesPaid, duesTotal]);

  const handleSaveDues = async () => {
    const totalAdd = Math.max(0, Number(duesToAdd) || 0);
    const paidAdd = Math.max(0, Number(paidToAdd) || 0);
    const updatedTotal = duesTotal + totalAdd;
    const updatedPaid = Math.min(updatedTotal, duesPaid + paidAdd);

    await setCurrentUserProfile({
      duesTotal: updatedTotal,
      duesPaid: updatedPaid,
    });

    setDuesToAdd('');
    setPaidToAdd('');
    setDuesModalOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/landing');
  };

  const openSocialLink = async (url: string | null, platform: 'Instagram' | 'TikTok') => {
    if (!url) {
      Alert.alert('Not found', `No ${platform} page found for this chapter yet.`);
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Cannot open link', `Unable to open the ${platform} URL.`);
      return;
    }

    await Linking.openURL(url);
  };

  const initials = (user?.displayName?.trim().charAt(0) ?? 'U').toUpperCase();

  const detailRows = [
    {
      icon: 'school' as const,
      label: 'School',
      value: safeText(user?.profile?.school),
    },
    {
      icon: 'map' as const,
      label: 'State',
      value: safeText(user?.profile?.state),
    },
    {
      icon: 'groups' as const,
      label: 'Chapter',
      value: safeText(user?.profile?.chapterName),
    },
    {
      icon: 'calendar-today' as const,
      label: 'Graduation',
      value: safeText(user?.profile?.gradDate),
    },
  ];

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>My Profile</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <LiquidGlass style={styles.profileCard} contentStyle={styles.profileInner}>
          <View style={styles.avatar}>
            {user?.profile?.profileImageUri ? (
              <Image source={{ uri: user.profile.profileImageUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.nameText}>{safeText(user?.displayName)}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>FBLA Member</Text>
          </View>

          <View style={styles.infoGroup}>
            {detailRows.map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <MaterialIcons name={item.icon} size={16} color={FBLA_BLUE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </LiquidGlass>

        <FrostedPanel style={styles.achievementsCard} contentStyle={styles.cardInner}>
          <View style={styles.duesHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="emoji-events" size={18} color={FBLA_BLUE} />
              <Text style={styles.sectionTitle}>Member Highlights</Text>
            </View>
            <TouchableOpacity style={styles.plusButton} onPress={() => setDuesModalOpen(true)}>
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.highlightRow}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightValue}>{duesPercent}%</Text>
              <Text style={styles.highlightLabel}>Dues Progress</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightValue}>${duesPaid}</Text>
              <Text style={styles.highlightLabel}>Paid</Text>
            </View>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightValue}>${duesTotal}</Text>
              <Text style={styles.highlightLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${duesPercent}%` }]} />
          </View>
          <Text style={styles.progressLabel}>${duesPaid} / ${duesTotal} paid</Text>
        </FrostedPanel>

        <FrostedPanel style={styles.socialCard} contentStyle={styles.cardInner}>
          <Text style={styles.sectionTitle}>Chapter Social Media</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.85}
              onPress={() => openSocialLink(socialLinks.instagramUrl, 'Instagram')}>
              <Ionicons name="logo-instagram" size={22} color="#fff" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.85}
              onPress={() => openSocialLink(socialLinks.tiktokUrl, 'TikTok')}>
              <Ionicons name="musical-notes" size={22} color="#fff" />
              <Text style={styles.socialText}>TikTok</Text>
            </TouchableOpacity>
          </View>
        </FrostedPanel>
      </ScrollView>

      <Modal visible={duesModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <FrostedPanel style={styles.modalCard} contentStyle={styles.modalCardInner}>
            <Text style={styles.modalTitle}>Update Dues</Text>

            <Text style={styles.modalHint}>Add to total dues</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={duesToAdd}
              onChangeText={setDuesToAdd}
              placeholder="0"
              placeholderTextColor="#8A94AD"
            />

            <Text style={styles.modalHint}>Add amount paid</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={paidToAdd}
              onChangeText={setPaidToAdd}
              placeholder="0"
              placeholderTextColor="#8A94AD"
            />

            <TouchableOpacity style={styles.modalSave} onPress={handleSaveDues}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setDuesModalOpen(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </FrostedPanel>
        </View>
      </Modal>
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 96 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontSize: 28, fontWeight: '900', color: FBLATheme.ink, marginTop: 2 },
  logoutButton: {
    backgroundColor: FBLATheme.yellowSoft,
    borderWidth: 1,
    borderColor: FBLA_YELLOW,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutButtonText: { color: FBLA_BLUE_DARK, fontWeight: '900', fontSize: 12 },
  profileCard: {
    borderRadius: FBLATheme.radius.xl,
  },
  profileInner: {
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: FBLA_YELLOW,
    borderWidth: 3,
    borderColor: '#FFE982',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: FBLA_BLUE_DARK, fontSize: 34, fontWeight: '900' },
  nameText: { marginTop: 12, color: FBLATheme.white, fontSize: 21, fontWeight: '900' },
  roleBadge: {
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#194DAF',
    borderWidth: 1,
    borderColor: '#4F75C7',
  },
  roleBadgeText: { color: FBLATheme.white, fontSize: 12, fontWeight: '800' },
  infoGroup: { width: '100%', marginTop: 14, gap: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3F7FF',
    borderWidth: 1,
    borderColor: '#CFE0FF',
    borderRadius: 12,
    padding: 10,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: FBLATheme.yellowSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { color: FBLATheme.muted, fontSize: 11, fontWeight: '800' },
  infoValue: { color: FBLATheme.ink, fontSize: 14, fontWeight: '800', marginTop: 1 },
  achievementsCard: {
    borderRadius: FBLATheme.radius.lg,
  },
  cardInner: { padding: 16 },
  duesHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { color: FBLA_BLUE, fontSize: 16, fontWeight: '800' },
  plusButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: FBLA_YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: { color: FBLA_BLUE_DARK, fontSize: 22, lineHeight: 24, fontWeight: '900' },
  highlightRow: { marginTop: 12, flexDirection: 'row', gap: 8 },
  highlightCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: FBLATheme.line,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.54)',
    alignItems: 'center',
    paddingVertical: 10,
  },
  highlightValue: { color: FBLA_BLUE, fontSize: 19, fontWeight: '900' },
  highlightLabel: { color: FBLATheme.muted, fontSize: 11, fontWeight: '800', marginTop: 2 },
  progressBarBackground: { marginTop: 12, height: 12, backgroundColor: '#E9EEFF', borderRadius: 999 },
  progressBarFill: { height: 12, backgroundColor: FBLA_YELLOW, borderRadius: 999 },
  progressLabel: { color: FBLATheme.muted, fontSize: 13, marginTop: 8, fontWeight: '700' },
  socialCard: {
    borderRadius: FBLATheme.radius.lg,
  },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FBLA_BLUE,
    borderRadius: 10,
    paddingVertical: 12,
  },
  socialText: { color: '#fff', fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 18, 40, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    borderRadius: FBLATheme.radius.xl,
  },
  modalCardInner: { padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: FBLA_BLUE, marginBottom: 4 },
  modalHint: { fontSize: 13, color: '#5B6A8F', marginTop: 10, marginBottom: 4, fontWeight: '600' },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DCE6FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0F172A',
  },
  modalSave: {
    marginTop: 14,
    backgroundColor: FBLA_BLUE,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalSaveText: { color: '#fff', fontWeight: '800' },
  modalCancel: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  modalCancelText: { color: '#5C6B91', fontWeight: '700' },
});
