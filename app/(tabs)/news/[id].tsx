import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { fetchLatestNewsItems, NEWS_ITEMS, NewsItem } from '@/lib/newsData';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground, LiquidGlass } from '@/components/liquid-glass';

const FBLA_BLUE = FBLATheme.blue;

export default function NewsArticleScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [newsItems, setNewsItems] = useState<NewsItem[]>(NEWS_ITEMS);
  const article = newsItems.find((item) => item.id === params.id);

  useEffect(() => {
    fetchLatestNewsItems().then(setNewsItems).catch(() => setNewsItems(NEWS_ITEMS));
  }, []);

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LiquidGlass style={styles.hero} contentStyle={styles.heroInner}>
          <Text style={styles.heroTitle}>FBLA News</Text>
          <Text style={styles.heroSubtitle}>Chapter and member updates</Text>
        </LiquidGlass>

        <View style={styles.cardsWrap}>
          {!article ? (
            <FrostedPanel style={styles.sectionCard} contentStyle={styles.sectionInner}>
              <Text style={styles.articleTitle}>Article not found</Text>
              <Text style={styles.paragraph}>Please return to the home screen and select a news item.</Text>
            </FrostedPanel>
          ) : (
            <FrostedPanel style={styles.sectionCard} contentStyle={styles.sectionInner}>
              <Text style={styles.dateText}>{article.dateLabel}</Text>
              <Text style={styles.articleTitle}>{article.title}</Text>
              {article.article.map((paragraph, index) => (
                <Text key={`${article.id}-${index}`} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </FrostedPanel>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    margin: 16,
    borderRadius: FBLATheme.radius.hero,
  },
  heroInner: {
    paddingTop: 24,
    paddingBottom: 42,
    paddingHorizontal: 18,
  },
  heroTitle: { color: FBLATheme.white, fontSize: 28, fontWeight: '900' },
  heroSubtitle: { color: '#D6E3FF', fontSize: 14, marginTop: 4 },
  cardsWrap: { padding: 16, marginTop: 6, gap: 12 },
  sectionCard: {
    borderRadius: 20,
  },
  sectionInner: {
    padding: 16,
  },
  dateText: { color: FBLATheme.muted, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  articleTitle: { fontSize: 22, lineHeight: 28, fontWeight: '800', color: FBLA_BLUE, marginBottom: 10 },
  paragraph: { color: FBLATheme.mutedStrong, fontSize: 15, lineHeight: 23, marginBottom: 10 },
});
