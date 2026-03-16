import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Race, RaceResult } from '../types';
import {
  getCurrentSeasonRaces,
  getRaceResults,
  getRaceStatus,
  getTeamColor,
  getDriverHeadshots,
  getCountryFlagUrl,
} from '../services/f1Api';
import { getCircuitImage } from '../utils/circuitImages';
import { colors, spacing, radius, typography } from '../theme';

interface RaceWithWinner extends Race {
  winner?: RaceResult;
  loadingResult?: boolean;
}

export function CoursesScreen({ navigation }: any) {
  const [races, setRaces] = useState<RaceWithWinner[]>([]);
  const [headshots, setHeadshots] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const allRaces = await getCurrentSeasonRaces();
    const finished = allRaces.filter((r) => getRaceStatus(r) === 'finished');
    const upcoming = allRaces.filter((r) => getRaceStatus(r) !== 'finished');

    // Load winner for each finished race + driver headshots in parallel
    const [withWinners, shots] = await Promise.all([
      Promise.all(
        finished.map(async (race) => {
          try {
            const results = await getRaceResults(race.season, race.round);
            return { ...race, winner: results[0] } as RaceWithWinner;
          } catch {
            return { ...race } as RaceWithWinner;
          }
        }),
      ),
      getDriverHeadshots(),
    ]);

    setHeadshots(shots);
    setRaces([...withWinners.reverse(), ...upcoming]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderRaceItem = ({ item }: { item: RaceWithWinner }) => {
    const status = getRaceStatus(item);
    const isFinished = status === 'finished';
    const isLive = status === 'live';
    const raceDate = new Date(`${item.date}T${item.time || '13:00:00Z'}`);

    return (
      <TouchableOpacity
        style={[styles.card, isLive && styles.cardLive]}
        onPress={() => navigation.navigate('CourseDetail', { race: item })}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.roundBadge}>
            <Text style={styles.roundText}>R{item.round}</Text>
          </View>
          {isLive && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>● EN DIRECT</Text>
            </View>
          )}
          {!isFinished && !isLive && (
            <Text style={styles.upcomingText}>
              {raceDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </Text>
          )}
          {isFinished && (
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          )}
        </View>

        {/* Race name with flag */}
        <View style={styles.raceNameRow}>
          {getCountryFlagUrl(item.Circuit.Location.country) ? (
            <Image
              source={{ uri: getCountryFlagUrl(item.Circuit.Location.country)! }}
              style={styles.flagImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.raceFlag}>🏁</Text>
          )}
          <Text style={styles.raceName} numberOfLines={1}>{item.raceName}</Text>
        </View>

        {/* Circuit + mini map */}
        <View style={styles.circuitSection}>
          <View style={styles.circuitInfo}>
            <View style={styles.circuitRow}>
              <Ionicons name="location-outline" size={12} color={colors.textMuted} />
              <Text style={styles.circuitText}> {item.Circuit.circuitName} · {item.Circuit.Location.country}</Text>
            </View>
          </View>
          {getCircuitImage(item.Circuit.circuitId) && (
            <View style={styles.miniMapWrapper}>
              <Image
                source={{ uri: getCircuitImage(item.Circuit.circuitId)! }}
                style={styles.miniMap}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Winner (if finished) */}
        {isFinished && item.winner ? (
          <View style={styles.winnerRow}>
            <View style={[styles.winnerBar, { backgroundColor: getTeamColor(item.winner.Constructor.name) }]} />
            {/* Driver headshot */}
            <View style={[styles.winnerPhoto, { borderColor: getTeamColor(item.winner.Constructor.name) }]}>
              {headshots[item.winner.Driver.code] ? (
                <Image
                  source={{ uri: headshots[item.winner.Driver.code] }}
                  style={styles.winnerPhotoImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.winnerPhotoPlaceholder, { backgroundColor: getTeamColor(item.winner.Constructor.name) + '33' }]}>
                  <Text style={[styles.winnerPhotoInitial, { color: getTeamColor(item.winner.Constructor.name) }]}>
                    {item.winner.Driver.familyName[0]}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.winnerInfo}>
              <Text style={styles.winnerLabel}>Vainqueur</Text>
              <Text style={styles.winnerName}>
                {item.winner.Driver.givenName} <Text style={styles.winnerFamily}>{item.winner.Driver.familyName}</Text>
              </Text>
              <Text style={styles.winnerTeam}>{item.winner.Constructor.name}</Text>
            </View>
            {item.winner.Time && (
              <Text style={styles.winnerTime}>{item.winner.Time.time}</Text>
            )}
          </View>
        ) : isFinished ? (
          <Text style={styles.noData}>Résultats non disponibles</Text>
        ) : (
          <View style={styles.upcomingRow}>
            <Ionicons
              name={isLive ? 'radio-outline' : 'timer-outline'}
              size={14}
              color={isLive ? colors.green : colors.textMuted}
            />
            <Text style={[styles.upcomingLabel, isLive && { color: colors.green }]}>
              {isLive ? ' Course en cours...' : ' Résultats disponibles après la course'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FlatList
        data={races}
        keyExtractor={(r) => r.round}
        renderItem={renderRaceItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.season}>SAISON {new Date().getFullYear()}</Text>
            <Text style={styles.title}>Courses</Text>
            <Text style={styles.subtitle}>
              {races.filter((r) => getRaceStatus(r) === 'finished').length} courses terminées
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  season: {
    color: colors.primary,
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.h1,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  list: { paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLive: {
    borderColor: colors.green,
    borderWidth: 1.5,
  },
  cardHeader: {
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
  liveBadge: {
    backgroundColor: colors.green + '22',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  liveText: {
    color: colors.green,
    ...typography.small,
    fontWeight: '700',
  },
  upcomingText: {
    color: colors.textMuted,
    ...typography.small,
  },
  raceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  raceFlag: {
    fontSize: 20,
  },
  flagImage: {
    width: 28,
    height: 20,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  raceName: {
    color: colors.text,
    ...typography.h3,
    flex: 1,
  },
  circuitSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  circuitInfo: {
    flex: 1,
  },
  circuitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circuitText: {
    color: colors.textMuted,
    ...typography.small,
  },
  miniMapWrapper: {
    width: 60,
    height: 40,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  miniMap: {
    width: '90%',
    height: '90%',
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  winnerBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
    marginRight: 4,
  },
  winnerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    marginRight: spacing.xs,
  },
  winnerPhotoImg: {
    width: '100%',
    height: '100%',
  },
  winnerPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerPhotoInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
  winnerInfo: { flex: 1 },
  winnerLabel: {
    color: colors.gold,
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  winnerName: {
    color: colors.text,
    ...typography.body,
  },
  winnerFamily: { fontWeight: '700' },
  winnerTeam: {
    color: colors.textSecondary,
    ...typography.small,
  },
  winnerTime: {
    color: colors.textMuted,
    ...typography.caption,
  },
  noData: {
    color: colors.textMuted,
    ...typography.caption,
    fontStyle: 'italic',
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingLabel: {
    color: colors.textMuted,
    ...typography.caption,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    ...typography.body,
  },
});
