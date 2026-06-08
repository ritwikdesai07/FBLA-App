import React from 'react';
import Constants from 'expo-constants';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PracticeQuizPdfViewProps = {
  source: number | { uri?: string; cache?: boolean };
  style?: object;
  onOpenExternal?: () => void;
};

export default function PracticeQuizPdfView({ source, style, onOpenExternal }: PracticeQuizPdfViewProps) {
  if (Constants.appOwnership === 'expo') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>PDF preview is not available in Expo Go.</Text>
        <Text style={styles.helper}>Use a development build for in-app PDF rendering, or open the file externally.</Text>
        <TouchableOpacity style={styles.button} onPress={onOpenExternal}>
          <Text style={styles.buttonText}>Open PDF</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Delay the native module load until runtime so Expo Go can still import this screen safely.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Pdf = require('react-native-pdf').default as React.ComponentType<any>;

  return (
    <Pdf
      source={source}
      style={style}
      trustAllCerts={false}
      onError={(error: object) => {
        console.error('PDF load error', error);
      }}
    />
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
