import { Alert, Linking } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from '@/lib/authStorage';
import {
  SocialMediaLinks,
  loadStoredSocialLinks,
  persistSocialLinks,
  searchChapterSocialLinks,
} from './socialMediaModel';

const emptyLinks: SocialMediaLinks = {
  chapterName: '',
  instagramUrl: null,
  tiktokUrl: null,
  instagramEmbedUrl: null,
};

export function useSocialMediaViewModel() {
  const [chapterName, setChapterName] = useState('');
  const [links, setLinks] = useState<SocialMediaLinks>(emptyLinks);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [stored, user] = await Promise.all([loadStoredSocialLinks(), getCurrentUser()]);
      const fallbackChapter = user?.profile?.chapterName?.trim() || '';

      setLinks(stored);
      setChapterName(stored.chapterName || fallbackChapter);
      setLoading(false);
    };

    void load();
  }, []);

  const hasSocialLinks = useMemo(() => !!links.instagramUrl || !!links.tiktokUrl, [links.instagramUrl, links.tiktokUrl]);

  const searchAndSave = async () => {
    if (!chapterName.trim()) {
      Alert.alert('Missing chapter name', 'Please enter your chapter name first.');
      return;
    }

    setSearching(true);
    try {
      const found = await searchChapterSocialLinks(chapterName);
      setLinks(found);
      await persistSocialLinks(found);
    } finally {
      setSearching(false);
    }
  };

  const openLink = async (url: string | null) => {
    if (!url) return;

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Cannot open link', 'This URL cannot be opened on this device.');
      return;
    }

    await Linking.openURL(url);
  };

  return {
    chapterName,
    setChapterName,
    links,
    loading,
    searching,
    hasSocialLinks,
    searchAndSave,
    openInstagram: () => openLink(links.instagramUrl),
    openTiktok: () => openLink(links.tiktokUrl),
  };
}
