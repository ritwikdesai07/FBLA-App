import React from 'react';
import { ActivityIndicator, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePracticeQuizViewerViewModel } from '@/viewmodels/usePracticeQuizViewModel';
import { FBLATheme } from '@/constants/theme';
import { FrostedPanel, LiquidBackground } from '@/components/liquid-glass';
import PracticeQuizPdfView from '@/screens/PracticeQuizPdfView';

const FBLA_BLUE = FBLATheme.blue;
const LOCAL_PDF_SOURCE_BY_EVENT: Record<string, number> = {
  Accounting: require('../assets/tests/Accounting Sample Questions.pdf'),
  'Business Ethics': require('../assets/tests/Business Ethics Sample Questions.pdf'),
};

export default function PracticeQuizViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ event?: string }>();
  const eventName = Array.isArray(params.event) ? params.event[0] : params.event || '';
  const { loading, selectedEvent } = usePracticeQuizViewerViewModel(eventName);
  const localSource = selectedEvent ? LOCAL_PDF_SOURCE_BY_EVENT[selectedEvent.name] : undefined;
  const hasAnyPdfSource = !!localSource || !!selectedEvent?.pdfUri;
  const isExpoGo = Constants.appOwnership === 'expo';
  const pdfSource = localSource ?? (selectedEvent?.pdfUri ? { uri: selectedEvent.pdfUri, cache: true } : undefined);

  const openFallbackPdf = async () => {
    if (localSource) {
      const resolved = Image.resolveAssetSource(localSource);
      const uri = resolved?.uri;
      if (uri) {
        const supported = await Linking.canOpenURL(uri);
        if (supported) {
          await Linking.openURL(uri);
          return;
        }
      }
    }

    const remoteUri = selectedEvent?.pdfUri;
    if (!remoteUri) return;
    const supported = await Linking.canOpenURL(remoteUri);
    if (!supported) return;
    await Linking.openURL(remoteUri);
  };

  if (loading) {
    return (
      <LiquidBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={FBLA_BLUE} size="large" />
          <Text style={styles.loadingText}>Loading quiz PDF...</Text>
        </View>
      </SafeAreaView>
      </LiquidBackground>
    );
  }

  return (
    <LiquidBackground>
    <SafeAreaView style={styles.container}>
      <FrostedPanel style={styles.header} contentStyle={styles.headerInner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={21} color={FBLA_BLUE} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {selectedEvent?.name || eventName || 'Practice Quiz'}
          </Text>
          <Text style={styles.subtitle}>Sample Questions PDF</Text>
        </View>
      </FrostedPanel>

      {!selectedEvent ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No matching practice quiz found.</Text>
        </View>
      ) : !hasAnyPdfSource ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No PDF has been added for this event yet.</Text>
        </View>
      ) : isExpoGo ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>PDF viewer is unavailable in this runtime.</Text>
          <Text style={styles.helperText}>Use a development build for in-app rendering, or open the PDF below.</Text>
          <TouchableOpacity style={styles.openExternalBtn} onPress={() => void openFallbackPdf()}>
            <Text style={styles.openExternalText}>Open PDF</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FrostedPanel style={styles.viewerCard} contentStyle={styles.viewerInner}>
          <PracticeQuizPdfView
            source={pdfSource!}
            style={styles.pdf}
            onOpenExternal={() => void openFallbackPdf()}
          />
        </FrostedPanel>
      )}
    </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    margin: 12,
    borderRadius: FBLATheme.radius.lg,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: FBLATheme.surfaceSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: FBLATheme.ink, fontSize: 16, fontWeight: '900' },
  subtitle: { color: FBLATheme.muted, fontSize: 12, marginTop: 2 },
  viewerCard: {
    flex: 1,
    margin: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  viewerInner: {
    flex: 1,
    padding: 0,
  },
  pdf: { flex: 1, width: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: { color: '#5B6A8F', fontWeight: '700' },
  errorText: { color: '#5B6A8F', fontSize: 14, fontWeight: '700' },
  helperText: { color: '#8A94AD', fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
  openExternalBtn: {
    marginTop: 12,
    backgroundColor: FBLA_BLUE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  openExternalText: { color: '#fff', fontWeight: '800' },
});
