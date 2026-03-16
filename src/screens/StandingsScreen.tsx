import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { getFlagEmoji, getTeamColor, getDriverHeadshots, getConstructorLogoUrl } from '../services/f1Api';
import { colors, spacing, radius, typography } from '../theme';

interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: { driverId: string; code: string; givenName: string; familyName: string; nationality: string };
  Constructors: { name: string; nationality: string }[];
}

interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: { constructorId: string; name: string; nationality: string };
}

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';

// Subcomponent to handle logo load errors gracefully
function ConstructorLogoImage({ logoUrl, teamColor, teamName, style }: { logoUrl: string | null; teamColor: string; teamName: string; style: any }) {
  const [hasError, setHasError] = React.useState(false);

  if (!logoUrl || hasError) {
    // Fallback: show team initials in a colored badge
    const initials = teamName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <View style={[style, { backgroundColor: teamColor + '22', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: teamColor, fontSize: 14, fontWeight: '800' }}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: logoUrl }}
      style={style}
      resizeMode="contain"
      onError={() => setHasError(true)}
    />
  );
}

export function StandingsScreen() {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [headshots, setHeadshots] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'drivers' | 'constructors'>('drivers');

  useEffect(() => {
    Promise.all([
      fetch(`${ERGAST_BASE}/current/driverStandings.json`).then((r) => r.json()),
      fetch(`${ERGAST_BASE}/current/constructorStandings.json`).then((r) => r.json()),
      getDriverHeadshots(),
    ]).then(([d, c, shots]) => {
      const dsList = d.MRData.StandingsTable.StandingsLists[0];
      const csList = c.MRData.StandingsTable.StandingsLists[0];
      setDriverStandings(dsList?.DriverStandings || []);
      setConstructorStandings(csList?.ConstructorStandings || []);
      setHeadshots(shots);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const renderDriverItem = ({ item, index }: { item: DriverStanding; index: number }) => {
    const teamColor = getTeamColor(item.Constructors[0]?.name || '');
    const photoUrl = headshots[item.Driver.code];

    return (
      <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
        {/* Left team color accent */}
        <View style={[styles.teamAccent, { backgroundColor: teamColor }]} />

        {/* Position */}
        <Text style={[styles.pos, parseInt(item.position) <= 3 && styles.posTop]}>
          {item.position}
        </Text>

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
                {item.Driver.familyName[0]}
              </Text>
            </View>
          )}
        </View>

        {/* Name block */}
        <View style={styles.nameBlock}>
          <Text style={styles.name}>
            <Text style={[styles.code, { color: teamColor }]}>{item.Driver.code} </Text>
            <Text style={styles.familyName}>{item.Driver.familyName}</Text>
          </Text>
          <View style={styles.teamRow}>
            <Text style={styles.flag}>{getFlagEmoji(item.Driver.nationality)}</Text>
            <Text style={styles.team}>{item.Constructors[0]?.name}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsBlock}>
          <Text style={styles.points}>{item.points}</Text>
          <Text style={styles.wins}>{item.wins}V</Text>
        </View>
      </View>
    );
  };

  const renderConstructorItem = ({ item, index }: { item: ConstructorStanding; index: number }) => {
    const teamColor = getTeamColor(item.Constructor.name);
    const logoUrl = getConstructorLogoUrl(item.Constructor.name);
    return (
      <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
        <View style={[styles.teamAccent, { backgroundColor: teamColor }]} />
        <Text style={[styles.pos, parseInt(item.position) <= 3 && styles.posTop]}>
          {item.position}
        </Text>
        {/* Constructor logo */}
        <View style={styles.logoWrapper}>
          <ConstructorLogoImage
            logoUrl={logoUrl}
            teamColor={teamColor}
            teamName={item.Constructor.name}
            style={styles.logo}
          />
        </View>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: teamColor }]}>{item.Constructor.name}</Text>
          <Text style={styles.team}>{getFlagEmoji(item.Constructor.nationality)}</Text>
        </View>
        <View style={styles.statsBlock}>
          <Text style={styles.points}>{item.points}</Text>
          <Text style={styles.wins}>{item.wins}V</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.hero}>
        <Text style={styles.season}>SAISON {new Date().getFullYear()}</Text>
        <Text style={styles.heroTitle}>Classements</Text>
      </View>

      <View style={styles.tabs}>
        {(['drivers', 'constructors'] as const).map((t) => (
          <View key={t} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text
              style={[styles.tabText, tab === t && styles.tabTextActive]}
              onPress={() => setTab(t)}
            >
              {t === 'drivers' ? 'Pilotes' : 'Constructeurs'}
            </Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des classements...</Text>
        </View>
      ) : tab === 'drivers' ? (
        <FlatList
          data={driverStandings}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderDriverItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={constructorStandings}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderConstructorItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  season: {
    color: colors.primary,
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: colors.text,
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, ...typography.body, fontWeight: '600' },
  tabTextActive: { color: colors.text },
  list: { paddingBottom: spacing.xl },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    gap: 8,
  },
  rowAlt: { backgroundColor: colors.surface + '88' },

  teamAccent: {
    width: 4,
    height: '100%',
    minHeight: 48,
  },

  pos: {
    width: 24,
    color: colors.textSecondary,
    ...typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  posTop: { color: colors.gold },

  photoWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 16,
    fontWeight: '700',
  },

  logoWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoBadge: {
    width: 40,
    height: 12,
    borderRadius: 6,
  },

  nameBlock: { flex: 1 },
  name: { color: colors.text, ...typography.body },
  code: { fontWeight: '800', fontSize: 13 },
  familyName: { fontWeight: '400' },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  flag: { fontSize: 12 },
  team: { color: colors.textMuted, ...typography.small },

  statsBlock: { alignItems: 'flex-end' },
  points: { color: colors.primary, ...typography.body, fontWeight: '700' },
  wins: { color: colors.textMuted, ...typography.small },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  loadingText: { color: colors.textSecondary, ...typography.body },
});
