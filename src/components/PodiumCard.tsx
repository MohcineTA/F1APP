import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RaceResult, QualifyingResult } from '../types';
import { colors, spacing, radius, typography } from '../theme';
import { getFlagEmoji, getTeamColor, getDriverHeadshots } from '../services/f1Api';

interface RacePodiumProps {
  results: RaceResult[];
}

interface QualifyingPodiumProps {
  results: QualifyingResult[];
}

function PositionMedal({ position }: { position: string }) {
  const medalColors: Record<string, string> = {
    '1': colors.gold,
    '2': colors.silver,
    '3': colors.bronze,
  };
  const color = medalColors[position] || colors.textMuted;
  return (
    <View style={[styles.medal, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.medalText, { color }]}>P{position}</Text>
    </View>
  );
}

export function RacePodium({ results }: RacePodiumProps) {
  const top3 = results.slice(0, 3);
  const [headshots, setHeadshots] = useState<Record<string, string>>({});

  useEffect(() => {
    getDriverHeadshots().then(setHeadshots);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Podium Course</Text>
      {top3.map((r) => {
        const photoUrl = headshots[r.Driver.code];
        const teamColor = getTeamColor(r.Constructor.name);
        return (
          <View key={r.position} style={styles.row}>
            <PositionMedal position={r.position} />
            <View style={[styles.teamBar, { backgroundColor: teamColor }]} />

            {/* Driver photo */}
            <View style={[styles.photoWrapper, { borderColor: teamColor }]}>
              {photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: teamColor + '33' }]}>
                  <Text style={[styles.photoInitial, { color: teamColor }]}>
                    {r.Driver.familyName[0]}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverFlag}>{getFlagEmoji(r.Driver.nationality)}</Text>
              <View>
                <Text style={styles.driverName}>
                  {r.Driver.givenName} <Text style={styles.driverFamily}>{r.Driver.familyName}</Text>
                </Text>
                <Text style={styles.team}>{r.Constructor.name}</Text>
              </View>
            </View>
            <View style={styles.timeContainer}>
              {r.Time ? (
                <Text style={styles.time}>{r.Time.time}</Text>
              ) : (
                <Text style={[styles.time, { color: colors.textMuted }]}>{r.status}</Text>
              )}
              <Text style={styles.points}>{r.points} pts</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function QualifyingPodium({ results }: QualifyingPodiumProps) {
  const top3 = results.slice(0, 3);
  const [headshots, setHeadshots] = useState<Record<string, string>>({});

  useEffect(() => {
    getDriverHeadshots().then(setHeadshots);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚡ Podium Qualifications</Text>
      {top3.map((r) => {
        const photoUrl = headshots[r.Driver.code];
        const teamColor = getTeamColor(r.Constructor.name);
        return (
          <View key={r.position} style={styles.row}>
            <PositionMedal position={r.position} />
            <View style={[styles.teamBar, { backgroundColor: teamColor }]} />

            {/* Driver photo */}
            <View style={[styles.photoWrapper, { borderColor: teamColor }]}>
              {photoUrl ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: teamColor + '33' }]}>
                  <Text style={[styles.photoInitial, { color: teamColor }]}>
                    {r.Driver.familyName[0]}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverFlag}>{getFlagEmoji(r.Driver.nationality)}</Text>
              <View>
                <Text style={styles.driverName}>
                  {r.Driver.givenName} <Text style={styles.driverFamily}>{r.Driver.familyName}</Text>
                </Text>
                <Text style={styles.team}>{r.Constructor.name}</Text>
              </View>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{r.Q3 || r.Q2 || r.Q1 || '—'}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    ...typography.h3,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  medal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  medalText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teamBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  driverInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  driverFlag: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  driverName: {
    color: colors.text,
    ...typography.body,
  },
  driverFamily: {
    fontWeight: '700',
  },
  team: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '600',
  },
  points: {
    color: colors.primary,
    ...typography.small,
    fontWeight: '600',
  },
  photoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
});
