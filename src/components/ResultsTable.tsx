import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { RaceResult, QualifyingResult } from '../types';
import { colors, spacing, radius, typography } from '../theme';
import { getFlagEmoji, getTeamColor, getDriverHeadshots } from '../services/f1Api';

interface RaceTableProps {
  results: RaceResult[];
}

interface QualifyingTableProps {
  results: QualifyingResult[];
}

export function RaceResultsTable({ results }: RaceTableProps) {
  const [headshots, setHeadshots] = useState<Record<string, string>>({});

  useEffect(() => {
    getDriverHeadshots().then(setHeadshots);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classement Course</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { width: 32 }]}>#</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Pilote</Text>
        <Text style={[styles.headerCell, { width: 80 }]}>Temps</Text>
        <Text style={[styles.headerCell, { width: 40 }]}>Pts</Text>
      </View>
      {results.map((r, i) => {
        const photoUrl = headshots[r.Driver.code];
        const teamColor = getTeamColor(r.Constructor.name);
        return (
          <View
            key={r.Driver.driverId}
            style={[styles.row, i % 2 === 0 && styles.rowAlt]}
          >
            <View style={[styles.posCell, { width: 32 }]}>
              <Text style={[styles.pos, parseInt(r.position) <= 3 && styles.posTop]}>
                {r.position}
              </Text>
            </View>
            <View style={[styles.driverCell, { flex: 1 }]}>
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
              <View style={styles.info}>
                <Text style={styles.flag}>{getFlagEmoji(r.Driver.nationality)}</Text>
                <View style={styles.nameInfo}>
                  <Text style={styles.name}>
                    <Text style={[styles.code, { color: teamColor }]}>{r.Driver.code} </Text>
                    {r.Driver.familyName}
                  </Text>
                  <Text style={styles.team}>{r.Constructor.name}</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 80, alignItems: 'flex-end' }}>
              <Text style={styles.time}>
                {r.Time?.time || (r.status !== 'Finished' ? r.status : '—')}
              </Text>
              {r.FastestLap?.rank === '1' && (
                <Text style={styles.fastestLap}>⚡ {r.FastestLap.Time.time}</Text>
              )}
            </View>
            <View style={{ width: 40, alignItems: 'flex-end' }}>
              <Text style={styles.points}>{r.points}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function QualifyingResultsTable({ results }: QualifyingTableProps) {
  const [headshots, setHeadshots] = useState<Record<string, string>>({});

  useEffect(() => {
    getDriverHeadshots().then(setHeadshots);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classement Qualifications</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { width: 32 }]}>#</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Pilote</Text>
        <Text style={[styles.headerCell, { width: 90 }]}>Meilleur</Text>
      </View>
      {results.map((r, i) => {
        const photoUrl = headshots[r.Driver.code];
        const teamColor = getTeamColor(r.Constructor.name);
        return (
          <View
            key={r.Driver.driverId}
            style={[styles.row, i % 2 === 0 && styles.rowAlt]}
          >
            <View style={[styles.posCell, { width: 32 }]}>
              <Text style={[styles.pos, parseInt(r.position) <= 3 && styles.posTop]}>
                {r.position}
              </Text>
            </View>
            <View style={[styles.driverCell, { flex: 1 }]}>
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
              <View style={styles.info}>
                <Text style={styles.flag}>{getFlagEmoji(r.Driver.nationality)}</Text>
                <View style={styles.nameInfo}>
                  <Text style={styles.name}>
                    <Text style={[styles.code, { color: teamColor }]}>{r.Driver.code} </Text>
                    {r.Driver.familyName}
                  </Text>
                  <Text style={styles.team}>{r.Constructor.name}</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 90, alignItems: 'flex-end' }}>
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.h3,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceElevated,
  },
  headerCell: {
    color: colors.textMuted,
    ...typography.small,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowAlt: {
    backgroundColor: colors.surfaceElevated + '55',
  },
  posCell: {
    alignItems: 'center',
  },
  pos: {
    color: colors.textSecondary,
    ...typography.body,
    fontWeight: '600',
  },
  posTop: {
    color: colors.gold,
  },
  driverCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    flexShrink: 0,
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
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  nameInfo: {
    flex: 1,
  },
  flag: {
    fontSize: 14,
    marginRight: 4,
  },
  name: {
    color: colors.text,
    ...typography.body,
  },
  code: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  team: {
    color: colors.textMuted,
    ...typography.small,
  },
  time: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '500',
  },
  fastestLap: {
    color: '#BF00FF',
    ...typography.small,
  },
  points: {
    color: colors.primary,
    ...typography.body,
    fontWeight: '700',
  },
});
