import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { getCurrentUser, logoutUser, setCurrentUserProfile, UserRecord } from '@/lib/authStorage';
import {
  SocialMediaLinks,
  loadStoredSocialLinks,
  persistSocialLinks,
  searchChapterSocialLinks,
} from '@/features/social-media/socialMediaModel';

const FBLA_BLUE = '#003DA5';
const BG = '#F5F8FF';

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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [current, links] = await Promise.all([getCurrentUser(), loadStoredSocialLinks()]);
      if (!mounted) return;
      setUser(current);
      setSocialLinks(links);
    };

    load();
    const interval = setInterval(load, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

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
    router.replace('/auth-choice');
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>My Profile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
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
        </View>

        <View style={styles.achievementsCard}>
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
        </View>

        <View style={styles.socialCard}>
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
        </View>
      </ScrollView>

      <Modal visible={duesModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16, gap: 12, paddingBottom: 92 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontSize: 26, fontWeight: '900', color: FBLA_BLUE },
  logoutButton: {
    backgroundColor: '#EEF3FF',
    borderWidth: 1,
    borderColor: '#D5E0FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  logoutButtonText: { color: FBLA_BLUE, fontWeight: '800', fontSize: 12 },
  profileCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EDF2FF',
    borderWidth: 4,
    borderColor: '#DCE6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: FBLA_BLUE, fontSize: 34, fontWeight: '900' },
  nameText: { marginTop: 10, color: '#0F172A', fontSize: 20, fontWeight: '800' },
  roleBadge: {
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF3FF',
    borderWidth: 1,
    borderColor: '#D6E2FF',
  },
  roleBadgeText: { color: FBLA_BLUE, fontSize: 12, fontWeight: '800' },
  infoGroup: { width: '100%', marginTop: 14, gap: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FBFF',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 12,
    padding: 10,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  infoValue: { color: '#0F172A', fontSize: 14, fontWeight: '700', marginTop: 1 },
  achievementsCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 16,
    padding: 14,
  },
  duesHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { color: FBLA_BLUE, fontSize: 16, fontWeight: '800' },
  plusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: FBLA_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: { color: '#fff', fontSize: 18, lineHeight: 19, fontWeight: '700' },
  highlightRow: { marginTop: 12, flexDirection: 'row', gap: 8 },
  highlightCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 12,
    backgroundColor: '#F9FBFF',
    alignItems: 'center',
    paddingVertical: 10,
  },
  highlightValue: { color: FBLA_BLUE, fontSize: 19, fontWeight: '900' },
  highlightLabel: { color: '#64748B', fontSize: 11, fontWeight: '700', marginTop: 2 },
  progressBarBackground: { marginTop: 12, height: 12, backgroundColor: '#E9EEFF', borderRadius: 999 },
  progressBarFill: { height: 12, backgroundColor: FBLA_BLUE, borderRadius: 999 },
  progressLabel: { color: '#5C6B91', fontSize: 13, marginTop: 8, fontWeight: '600' },
  socialCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6EDFF',
    borderRadius: 16,
    padding: 14,
  },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FBLA_BLUE,
    borderRadius: 12,
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
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE6FF',
  },
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
