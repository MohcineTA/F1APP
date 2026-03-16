import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';
import { getCircuitImage } from '../utils/circuitImages';

interface CircuitMapProps {
  circuitId: string;
}

export function CircuitMap({ circuitId }: CircuitMapProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageUrl = getCircuitImage(circuitId);
  if (!imageUrl || error) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>TRACÉ DU CIRCUIT</Text>
      <View style={styles.imageWrapper}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, loading && styles.hidden]}
          resizeMode="contain"
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  label: {
    color: colors.textMuted,
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  imageWrapper: {
    height: 180,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated ?? '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingOverlay: {
    position: 'absolute',
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hidden: {
    opacity: 0,
  },
});
