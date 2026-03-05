
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';

// Helper to resolve image sources (handles both local require() and remote URLs)
function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

interface PlayLinkLogoProps {
  size?: number;
  variant?: 'full' | 'icon';
}

export function PlayLinkLogo({ size = 120, variant = 'full' }: PlayLinkLogoProps) {
  const logoSource = variant === 'full' 
    ? require('@/assets/images/efdb3d46-d228-453c-bd96-dbf9f66de36c.png')
    : require('@/assets/images/efdb3d46-d228-453c-bd96-dbf9f66de36c.png');

  return (
    <View style={styles.container}>
      <Image
        source={resolveImageSource(logoSource)}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});
