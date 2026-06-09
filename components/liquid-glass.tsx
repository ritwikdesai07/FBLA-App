import React from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { FBLATheme, fblaShadow } from '@/constants/theme';

type LiquidBackgroundProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

type LiquidGlassProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
};

type ProfileOrbProps = {
  displayName?: string;
  imageUri?: string | null;
  onPress: () => void;
};

export function LiquidBackground({ children, style }: LiquidBackgroundProps) {
  return (
    <View style={[styles.background, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={['#F8FBFF', '#E8F1FF', '#FFF3A6']}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255, 210, 0, 0.62)', 'rgba(255, 210, 0, 0)']}
        start={{ x: 0.18, y: 0.12 }}
        end={{ x: 0.78, y: 0.92 }}
        style={[styles.blob, styles.goldBlob]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0, 61, 165, 0.45)', 'rgba(0, 61, 165, 0)']}
        start={{ x: 0.1, y: 0.08 }}
        end={{ x: 0.9, y: 0.95 }}
        style={[styles.blob, styles.blueBlob]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={[styles.blob, styles.whiteVeil]}
      />
      {children}
    </View>
  );
}

export function LiquidGlass({ children, style, contentStyle, intensity = 82 }: LiquidGlassProps) {
  return (
    <View style={[styles.glassShell, style]}>
      <BlurView tint="dark" intensity={intensity} style={styles.blur}>
        <LinearGradient
          colors={['rgba(13, 44, 111, 0.76)', 'rgba(0, 43, 115, 0.58)', 'rgba(255, 244, 184, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.glassTint, contentStyle]}>
          {children}
        </LinearGradient>
      </BlurView>
    </View>
  );
}

export function FrostedPanel({ children, style, contentStyle, intensity = 70 }: LiquidGlassProps) {
  return (
    <View style={[styles.frostedShell, style]}>
      <BlurView tint="light" intensity={intensity} style={styles.blur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.86)', 'rgba(243, 247, 255, 0.78)', 'rgba(255, 244, 184, 0.45)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.frostedTint, contentStyle]}>
          {children}
        </LinearGradient>
      </BlurView>
    </View>
  );
}

export function ProfileOrb({ displayName, imageUri, onPress }: ProfileOrbProps) {
  const initial = (displayName?.trim().charAt(0) || 'U').toUpperCase();

  return (
    <TouchableOpacity style={styles.profileButton} activeOpacity={0.84} onPress={onPress}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.profileImage} />
      ) : (
        <LinearGradient
          colors={[FBLATheme.yellow, '#FFF4B8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileInitialWrap}>
          <Text style={styles.profileInitial}>{initial}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

export function LogoMedallion({ source, style }: { source: ImageSourcePropType; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.logoShadow, style]}>
      <LinearGradient
        colors={[FBLATheme.yellow, '#FFF1A3', '#C9DBFF', FBLATheme.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoPlate}>
        <View style={styles.logoRimHighlight} />
        <View style={styles.logoInner}>
          <Image source={source} style={styles.logoImage} resizeMode="contain" />
        </View>
      </LinearGradient>
      <View style={styles.logoDropPlane} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: FBLATheme.white,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  goldBlob: {
    width: 310,
    height: 310,
    top: -92,
    right: -126,
  },
  blueBlob: {
    width: 350,
    height: 350,
    top: 128,
    left: -178,
  },
  whiteVeil: {
    width: 260,
    height: 260,
    right: -68,
    bottom: 80,
  },
  glassShell: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.36)',
    ...fblaShadow({ opacity: 0.24, radius: 24, offsetY: 14, elevation: 12 }),
  },
  blur: {
    overflow: 'hidden',
  },
  glassTint: {
    padding: 18,
  },
  frostedShell: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.64)',
    ...fblaShadow({ opacity: 0.14, radius: 18, offsetY: 10, elevation: 8 }),
  },
  frostedTint: {
    padding: 16,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    ...fblaShadow({ opacity: 0.22, radius: 12, offsetY: 6, elevation: 8 }),
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInitialWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: FBLATheme.blueDark,
    fontSize: 18,
    fontWeight: '900',
  },
  logoShadow: {
    ...fblaShadow({ opacity: 0.34, radius: 30, offsetY: 22, elevation: 16 }),
  },
  logoPlate: {
    width: 152,
    height: 152,
    borderRadius: 40,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  logoRimHighlight: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 18,
    height: 38,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  logoInner: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 43, 115, 0.12)',
    ...fblaShadow({ opacity: 0.18, radius: 12, offsetY: 7, elevation: 5 }),
  },
  logoImage: {
    width: 98,
    height: 98,
  },
  logoDropPlane: {
    position: 'absolute',
    left: 14,
    right: 8,
    bottom: -10,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 26, 79, 0.18)',
    transform: [{ skewX: '-18deg' }],
  },
});
