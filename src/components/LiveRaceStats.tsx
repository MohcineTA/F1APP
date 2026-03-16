import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getLiveSessionKey,
  getLiveRaceStats,
  getTyreColor,
  LiveDriverStats,
} from '../services/f1Api';
import { colors, spacing, radius, typography } from '../theme';

const REFRESH_INTERVAL = 10000; // 10 secondes

interface Props {
  raceDate: string;
  raceTime?: string;
}

function TyreBadge({ compound, age }: { compound: string; age: number }) {
  const tyreColor = getTyreColor(compound);
  const label = compound === '?' ? '?' : compound.charAt(0);
  return (
    <View style={[styles.tyreBadge, { borderColor: tyreColor }]}>
      <Text style={[styles.tyreLabel, { color: tyreColor }]}>{label}</Text>
      {age > 0 && <Text style={styles.tyreAge}>{age}</Text>}
    </View>
  );
}

export function LiveRaceStats({ raceDate, raceTime }: Props) {
  const [stats, setStats] = useState<LiveDriverStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [sessionKey, setSessionKey] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = async (key: number) => {
    try {
      const data = await getLiveRaceStats(key);
      if (data.length > 0) {
        setStats(data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError('Données en attente...');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const key = await getLiveSessionKey();
      if (!mounted) return;
      if (!key) {
        setError('Session introuvable');
        setLoading(false);
        return;
      }
      setSessionKey(key);
      await fetchStats(key);

      intervalRef.current = setInterval(() => {
        if (mounted) fetchStats(key);
      }, REFRESH_INTERVAL);
    };

    init();
    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const maxLap = stats.length > 0 ? Math.max(...stats.map(s => s.lap_number)) : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Connexion au live...</Text>
      </View>
    );
  }

  if (error && stats.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={28} color={colors.orange} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSub}>Les données live apparaîtront au départ de la course</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header live */}
      <View style={styles.header}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
        <View style={styles.headerRight}>
          {maxLap > 0 && (
            <Text style={styles.lapInfo}>Tour {maxLap}</Text>
          )}
          {lastUpdate && (
            <Text style={styles.updateTime}>
              MàJ {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          )}
        </View>
      </View>

      {/* Légende colonnes */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, { width: 28 }]}>#</Text>
        <Text style={[styles.colHeader, { flex: 1 }]}>Pilote</Text>
        <Text style={[styles.colHeader, { width: 72 }]}>GAP</Text>
        <Text style={[styles.colHeader, { width: 72 }]}>INTER</Text>
        <Text style={[styles.colHeader, { width: 72 }]}>TOUR</Text>
        <Text style={[styles.colHeader, { width: 36 }]}>PNE</Text>
      </View>

      {/* Rows */}
      {stats.map((s, i) => {
        const teamColor = s.driver.team_colour
          ? `#${s.driver.team_colour}`
          : '#FFFFFF';
        const isLeader = s.position === 1;

        return (
          <View
            key={s.driver.driver_number}
            style={[styles.row, i % 2 === 0 && styles.rowAlt]}
          >
            {/* Position */}
            <View style={[styles.posCell, { width: 28 }]}>
              <Text style={[styles.pos, isLeader && styles.posLeader]}>
                {s.position}
              </Text>
            </View>

            {/* Driver */}
            <View style={[styles.driverCell, { flex: 1 }]}>
              <View style={[styles.teamBar, { backgroundColor: teamColor }]} />
              <View>
                <Text style={styles.acronym}>{s.driver.name_acronym}</Text>
                <Text style={styles.team} numberOfLines={1}>{s.driver.team_name}</Text>
              </View>
            </View>

            {/* Gap to leader */}
            <Text style={[styles.cell, { width: 72 },
              s.gap_to_leader === 'LEADER' && styles.leaderText,
            ]}>
              {s.gap_to_leader}
            </Text>

            {/* Interval */}
            <Text style={[styles.cell, { width: 72 }]}>{s.interval}</Text>

            {/* Last lap */}
            <Text style={[styles.cell, { width: 72 }]}>{s.last_lap}</Text>

            {/* Tyre */}
            <View style={{ width: 36, alignItems: 'center' }}>
              <TyreBadge compound={s.compound} age={s.tyre_age} />
            </View>
          </View>
        );
      })}

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="refresh-outline" size={12} color={colors.textMuted} />
        <Text style={styles.footerText}> Actualisation auto toutes les 10s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary + '55',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.primary + '22',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '33',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  liveText: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  lapInfo: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '700',
  },
  updateTime: {
    color: colors.textMuted,
    ...typography.small,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colHeader: {
    color: colors.textMuted,
    ...typography.small,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  rowAlt: {
    backgroundColor: colors.surfaceElevated + '66',
  },
  posCell: { alignItems: 'center' },
  pos: {
    color: colors.textSecondary,
    ...typography.body,
    fontWeight: '700',
  },
  posLeader: { color: colors.gold },
  driverCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamBar: {
    width: 3,
    height: 28,
    borderRadius: 2,
  },
  acronym: {
    color: colors.text,
    ...typography.body,
    fontWeight: '700',
  },
  team: {
    color: colors.textMuted,
    ...typography.small,
    maxWidth: 80,
  },
  cell: {
    color: colors.text,
    ...typography.small,
    fontWeight: '500',
    textAlign: 'right',
  },
  leaderText: {
    color: colors.gold,
    fontWeight: '700',
  },
  tyreBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tyreLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  tyreAge: {
    position: 'absolute',
    bottom: -6,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
  },
  centered: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.orange,
    ...typography.body,
    fontWeight: '600',
  },
  errorSub: {
    color: colors.textMuted,
    ...typography.caption,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.textMuted,
    ...typography.small,
  },
});
