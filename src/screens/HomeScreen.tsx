import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Race } from '../types';
import { getCurrentSeasonRaces, getRaceStatus, getNextRace } from '../services/f1Api';
import { RaceCard } from '../components/RaceCard';
import { colors, spacing, typography } from '../theme';

type FilterType = 'all' | 'upcoming' | 'finished';

export function HomeScreen({ navigation }: any) {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [nextRace, setNextRace] = useState<Race | null>(null);

  const loadRaces = useCallback(async () => {
    const data = await getCurrentSeasonRaces();
    setRaces(data);
    setNextRace(getNextRace(data));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadRaces();
  }, [loadRaces]);

  const filteredRaces = races.filter((r) => {
    const status = getRaceStatus(r);
    if (filter === 'upcoming') return status === 'upcoming' || status === 'live';
    if (filter === 'finished') return status === 'finished';
    return true;
  });

  const renderHeader = () => (
    <View>
      <View style={styles.hero}>
        <Text style={styles.season}>SAISON {new Date().getFullYear()}</Text>
        <View style={styles.titleRow}>
          <Image source={require('../../assets/f1.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heroTitle}>Calendrier F1</Text>
        </View>
        {nextRace && (
          <View style={styles.nextInfo}>
            <Text style={styles.nextLabel}>Prochaine course :</Text>
            <Text style={styles.nextName}>{nextRace.raceName}</Text>
          </View>
        )}
      </View>

      <View style={styles.filters}>
        {(['all', 'upcoming', 'finished'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Tout' : f === 'upcoming' ? 'À venir' : 'Terminé'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du calendrier...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FlatList
        data={filteredRaces}
        keyExtractor={(r) => r.round}
        renderItem={({ item }) => (
          <RaceCard
            race={item}
            status={getRaceStatus(item)}
            isNext={nextRace?.round === item.round}
            onPress={() => navigation.navigate('RaceDetail', { race: item })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="flag-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Aucune course trouvée</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadRaces(); }}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  season: {
    color: colors.primary,
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  heroTitle: {
    color: colors.text,
    ...typography.h1,
  },
  nextInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  nextLabel: {
    color: colors.textSecondary,
    ...typography.caption,
  },
  nextName: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    ...typography.caption,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  list: {
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  emptyText: {
    color: colors.textSecondary,
    ...typography.body,
  },
});
