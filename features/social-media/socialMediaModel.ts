import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '@/lib/authStorage';

export type SocialMediaLinks = {
  chapterName: string;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  instagramEmbedUrl: string | null;
};

const SOCIAL_MEDIA_KEY_PREFIX = '@fbla_social_media_v1_';

const emptyLinks = (chapterName = ''): SocialMediaLinks => ({
  chapterName,
  instagramUrl: null,
  tiktokUrl: null,
  instagramEmbedUrl: null,
});

const normalizeChapter = (chapterName: string) => {
  const lower = chapterName.toLowerCase().trim();
  return lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(fbla|chapter|high|school)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildUsernameCandidates = (chapterName: string) => {
  const normalized = normalizeChapter(chapterName);
  const collapsed = normalized.replace(/\s+/g, '');
  const underscored = normalized.replace(/\s+/g, '_');
  const dashed = normalized.replace(/\s+/g, '');

  const candidates = new Set<string>([
    `${collapsed}fbla`,
    `fbla${collapsed}`,
    `${underscored}_fbla`,
    `fbla_${underscored}`,
    `${dashed}.fbla`,
    `${dashed}fblachapter`,
  ]);

  return [...candidates].filter((item) => !!item && item.length >= 3).slice(0, 10);
};

const looksLikeNotFoundPage = (platform: 'instagram' | 'tiktok', html: string) => {
  const lower = html.toLowerCase();
  if (platform === 'instagram') {
    return lower.includes("sorry, this page isn't available") || lower.includes('page not found');
  }

  return (
    lower.includes("couldn't find this account") ||
    lower.includes("couldn't find this user") ||
    lower.includes('page not available')
  );
};

const validateProfileUrl = async (platform: 'instagram' | 'tiktok', url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const html = await res.text();
    return !looksLikeNotFoundPage(platform, html);
  } catch {
    return false;
  }
};

const findFromKnownPatterns = async (chapterName: string) => {
  const candidates = buildUsernameCandidates(chapterName);
  let instagramUrl: string | null = null;
  let tiktokUrl: string | null = null;

  for (const username of candidates) {
    if (!instagramUrl) {
      const candidate = `https://www.instagram.com/${username}/`;
      if (await validateProfileUrl('instagram', candidate)) {
        instagramUrl = candidate;
      }
    }

    if (!tiktokUrl) {
      const candidate = `https://www.tiktok.com/@${username}`;
      if (await validateProfileUrl('tiktok', candidate)) {
        tiktokUrl = candidate;
      }
    }

    if (instagramUrl && tiktokUrl) break;
  }

  return { instagramUrl, tiktokUrl };
};

const extractFirstMatch = (regex: RegExp, input: string) => {
  const match = input.match(regex);
  return match?.[0] ?? null;
};

const findFromWebSearch = async (chapterName: string) => {
  try {
    const query = encodeURIComponent(`${chapterName} FBLA instagram tiktok`);
    const response = await fetch(`https://duckduckgo.com/html/?q=${query}`);
    if (!response.ok) return { instagramUrl: null, tiktokUrl: null, instagramEmbedUrl: null };

    const html = await response.text();
    const instagramProfile = extractFirstMatch(/https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?/i, html);
    const tiktokProfile = extractFirstMatch(/https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+\/?/i, html);
    const instagramPost = extractFirstMatch(/https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?/i, html);

    return {
      instagramUrl: instagramProfile,
      tiktokUrl: tiktokProfile,
      instagramEmbedUrl: instagramPost ? `${instagramPost.replace(/\/$/, '')}/embed` : null,
    };
  } catch {
    return { instagramUrl: null, tiktokUrl: null, instagramEmbedUrl: null };
  }
};

const getStorageKeyForCurrentUser = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return `${SOCIAL_MEDIA_KEY_PREFIX}${user.username}`;
};

export const loadStoredSocialLinks = async (): Promise<SocialMediaLinks> => {
  const user = await getCurrentUser();
  if (!user) return emptyLinks('');

  const key = await getStorageKeyForCurrentUser();
  if (!key) return emptyLinks(user.profile?.chapterName?.trim() || '');
  const raw = await AsyncStorage.getItem(key);

  if (!raw) {
    return emptyLinks(user.profile?.chapterName?.trim() || '');
  }

  try {
    const parsed = JSON.parse(raw) as SocialMediaLinks;
    return {
      chapterName: parsed.chapterName || user.profile?.chapterName?.trim() || '',
      instagramUrl: parsed.instagramUrl ?? null,
      tiktokUrl: parsed.tiktokUrl ?? null,
      instagramEmbedUrl: parsed.instagramEmbedUrl ?? null,
    };
  } catch {
    return emptyLinks(user.profile?.chapterName?.trim() || '');
  }
};

export const persistSocialLinks = async (links: SocialMediaLinks) => {
  const key = await getStorageKeyForCurrentUser();
  if (!key) return;
  await AsyncStorage.setItem(key, JSON.stringify(links));
};

export const searchChapterSocialLinks = async (chapterName: string): Promise<SocialMediaLinks> => {
  const cleanChapter = chapterName.trim();
  if (!cleanChapter) {
    return emptyLinks('');
  }

  const searched = await findFromWebSearch(cleanChapter);
  let instagramUrl = searched.instagramUrl;
  let tiktokUrl = searched.tiktokUrl;
  let instagramEmbedUrl = searched.instagramEmbedUrl;

  if (!instagramUrl || !tiktokUrl) {
    const patternResult = await findFromKnownPatterns(cleanChapter);
    instagramUrl = instagramUrl || patternResult.instagramUrl;
    tiktokUrl = tiktokUrl || patternResult.tiktokUrl;
  }

  if (instagramUrl && !instagramEmbedUrl) {
    instagramEmbedUrl = `${instagramUrl.replace(/\/$/, '')}/embed`;
  }

  return {
    chapterName: cleanChapter,
    instagramUrl: instagramUrl ?? null,
    tiktokUrl: tiktokUrl ?? null,
    instagramEmbedUrl: instagramEmbedUrl ?? null,
  };
};
