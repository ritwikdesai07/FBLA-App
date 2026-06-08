import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PracticeQuizPdfViewProps = {
  source: number | { uri?: string; cache?: boolean };
  style?: object;
  onOpenExternal?: () => void;
};

export default function PracticeQuizPdfView({ onOpenExternal }: PracticeQuizPdfViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PDF preview is not available on web.</Text>
      <Text style={styles.helper}>Open the PDF in a browser tab to view or download it.</Text>
      <TouchableOpacity style={styles.button} onPress={onOpenExternal}>
        <Text style={styles.buttonText}>Open PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  title: {
    color: '#5B6A8F',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  helper: {
    color: '#8A94AD',
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#0B6BCB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
