import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NEWS_ITEMS } from '@/lib/newsData';

const FBLA_BLUE = '#003DA5';
const FBLA_YELLOW = '#F0E15B';
const BG = '#F5F8FF';

export default function NewsArticleScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const article = NEWS_ITEMS.find((item) => item.id === params.id);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>FBLA News</Text>
          <Text style={styles.heroSubtitle}>Chapter and member updates</Text>
          <View style={styles.logoCircle}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.cardsWrap}>
          {!article ? (
            <View style={styles.sectionCard}>
              <Text style={styles.articleTitle}>Article not found</Text>
              <Text style={styles.paragraph}>Please return to the home screen and select a news item.</Text>
            </View>
          ) : (
            <View style={styles.sectionCard}>
              <Text style={styles.dateText}>{article.dateLabel}</Text>
              <Text style={styles.articleTitle}>{article.title}</Text>
              {article.article.map((paragraph, index) => (
                <Text key={`${article.id}-${index}`} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  hero: {
    backgroundColor: FBLA_BLUE,
    paddingTop: 24,
    paddingBottom: 42,
    paddingHorizontal: 18,
  },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: 0.2 },
  heroSubtitle: { color: '#D6E3FF', fontSize: 14, marginTop: 4 },
  logoCircle: {
    position: 'absolute',
    right: 16,
    bottom: -28,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: FBLA_YELLOW,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A1A3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: { width: 60, height: 60 },
  cardsWrap: { padding: 16, marginTop: 6, gap: 12 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    padding: 14,
  },
  dateText: { color: '#6A7AA6', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  articleTitle: { fontSize: 22, lineHeight: 28, fontWeight: '800', color: FBLA_BLUE, marginBottom: 10 },
  paragraph: { color: '#334155', fontSize: 15, lineHeight: 23, marginBottom: 10 },
});
