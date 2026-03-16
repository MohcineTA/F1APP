import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Race, RaceStatus } from '../types';
import { getCountryFlagUrl } from '../services/f1Api';
import { colors, spacing, radius, typography } from '../theme';

interface Props {
  race: Race;
  status: RaceStatus;
  isNext?: boolean;
  onPress: () => void;
}

const STATUS_LABEL: Record<RaceStatus, string> = {
  upcoming: 'À VENIR',
  live: '● EN DIRECT',
  finished: 'TERMINÉ',
};

const STATUS_COLOR: Record<RaceStatus, string> = {
  upcoming: colors.textSecondary,
  live: colors.green,
  finished: colors.textMuted,
};

function useCountdown(targetDate: Date, enabled: boolean) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const update = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    intervalRef.current = setInterval(update, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetDate, enabled]);

  return timeLeft;
}

export function RaceCard({ race, status, isNext, onPress }: Props) {
  const raceDate = new Date(`${race.date}T${race.time || '13:00:00Z'}`);
  const formattedDate = raceDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = race.time
    ? raceDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const flagUrl = getCountryFlagUrl(race.Circuit.Location.country);
  const isUpcoming = status === 'upcoming';
  const countdown = useCountdown(raceDate, isUpcoming);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <TouchableOpacity
      style={[styles.card, isNext && styles.nextCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isNext && (
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>PROCHAINE COURSE</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.roundBadge}>
          <Text style={styles.roundText}>R{race.round}</Text>
        </View>
        <Text style={[styles.statusLabel, { color: STATUS_COLOR[status] }]}>
          {STATUS_LABEL[status]}
        </Text>
      </View>

      <View style={styles.raceNameRow}>
        {flagUrl ? (
          <Image source={{ uri: flagUrl }} style={styles.flagImage} resizeMode="cover" />
        ) : (
          <Text style={styles.flagFallback}>🏁</Text>
        )}
        <Text style={styles.raceName} numberOfLines={1}>{race.raceName}</Text>
      </View>

      <View style={styles.circuitRow}>
        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.circuitName}> {race.Circuit.circuitName}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.date}> {formattedDate}</Text>
          {formattedTime && (
            <Text style={styles.time}> · {formattedTime}</Text>
          )}
        </View>
        <Text style={styles.country}>{race.Circuit.Location.country}</Text>
      </View>

      {/* Countdown for upcoming races */}
      {isUpcoming && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0) && (
        <View style={styles.countdownContainer}>
          <Ionicons name="timer-outline" size={14} color={colors.primary} />
          <View style={styles.countdownBlocks}>
            <View style={styles.countdownBlock}>
              <Text style={styles.countdownValue}>{pad(countdown.days)}</Text>
              <Text style={styles.countdownLabel}>J</Text>
            </View>
            <Text style={styles.countdownSep}>:</Text>
            <View style={styles.countdownBlock}>
              <Text style={styles.countdownValue}>{pad(countdown.hours)}</Text>
              <Text style={styles.countdownLabel}>H</Text>
            </View>
            <Text style={styles.countdownSep}>:</Text>
            <View style={styles.countdownBlock}>
              <Text style={styles.countdownValue}>{pad(countdown.minutes)}</Text>
              <Text style={styles.countdownLabel}>M</Text>
            </View>
            <Text style={styles.countdownSep}>:</Text>
            <View style={styles.countdownBlock}>
              <Text style={styles.countdownValue}>{pad(countdown.seconds)}</Text>
              <Text style={styles.countdownLabel}>S</Text>
            </View>
          </View>
        </View>
      )}

      {status === 'finished' && (
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  nextBadge: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  nextBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  roundBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  roundText: {
    color: colors.textSecondary,
    ...typography.small,
    fontWeight: '600',
  },
  statusLabel: {
    ...typography.small,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  raceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  flagImage: {
    width: 28,
    height: 20,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  flagFallback: {
    fontSize: 20,
  },
  raceName: {
    color: colors.text,
    ...typography.h3,
    flex: 1,
  },
  circuitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  circuitName: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  time: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: '600',
  },
  country: {
    color: colors.textMuted,
    ...typography.caption,
  },
  // Countdown
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  countdownBlocks: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  countdownBlock: {
    alignItems: 'center',
    minWidth: 32,
  },
  countdownValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  countdownSep: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  chevron: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
  },
});
