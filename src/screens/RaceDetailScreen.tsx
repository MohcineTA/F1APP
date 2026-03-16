import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Race, RaceResult, QualifyingResult } from '../types';
import { getRaceResults, getQualifyingResults, getRaceStatus } from '../services/f1Api';
import { RacePodium, QualifyingPodium } from '../components/PodiumCard';
import { LiveRaceStats } from '../components/LiveRaceStats';
import { RaceResultsTable, QualifyingResultsTable } from '../components/ResultsTable';
import { scheduleRaceNotification, cancelRaceNotification } from '../hooks/useNotifications';
import { CircuitMap } from '../components/CircuitMap';
import { colors, spacing, radius, typography } from '../theme';

type TabType = 'race' | 'qualifying';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    setTimeout(() => {
      window.alert(`${title}\n\n${message}`);
    }, 100);
  } else {
    Alert.alert(title, message);
  }
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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [targetDate, enabled]);

  return timeLeft;
}

function UpcomingBanner({ raceDate, notifId, onNotification }: { raceDate: Date; notifId: string | null; onNotification: () => void }) {
  const countdown = useCountdown(raceDate, true);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={styles.upcomingBanner}>
      <Ionicons name="timer-outline" size={32} color={colors.primary} />
      <Text style={styles.upcomingTitle}>Course à venir</Text>

      {/* Countdown */}
      <View style={styles.countdownRow}>
        {[
          { value: countdown.days, label: 'JOURS' },
          { value: countdown.hours, label: 'HEURES' },
          { value: countdown.minutes, label: 'MIN' },
          { value: countdown.seconds, label: 'SEC' },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <Text style={styles.countdownSep}>:</Text>}
            <View style={styles.countdownBlock}>
              <Text style={styles.countdownValue}>{pad(item.value)}</Text>
              <Text style={styles.countdownLabel}>{item.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.upcomingText}>
        Les résultats seront disponibles après la course.
      </Text>
      <TouchableOpacity style={styles.notifButton} onPress={onNotification}>
        <Ionicons
          name={notifId ? 'notifications' : 'notifications-outline'}
          size={18}
          color={colors.text}
        />
        <Text style={styles.notifButtonText}>
          {notifId ? 'Rappel activé' : 'Activer le rappel'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function RaceDetailScreen({ route, navigation }: any) {
  const { race }: { race: Race } = route.params;
  const status = getRaceStatus(race);

  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [qualResults, setQualResults] = useState<QualifyingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('race');
  const [notifId, setNotifId] = useState<string | null>(null);

  const raceDate = new Date(`${race.date}T${race.time || '13:00:00Z'}`);
  const formattedDate = raceDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    if (status === 'finished') {
      setLoading(true);
      Promise.all([
        getRaceResults(race.season, race.round),
        getQualifyingResults(race.season, race.round),
      ]).then(([rr, qr]) => {
        setRaceResults(rr);
        setQualResults(qr);
        setLoading(false);
      });
    }
  }, [race, status]);

  const handleNotification = async () => {
    if (notifId) {
      await cancelRaceNotification(notifId);
      setNotifId(null);
      showAlert('Notification annulée', `Rappel pour ${race.raceName} supprimé.`);
    } else {
      const id = await scheduleRaceNotification(race);
      if (id) {
        setNotifId(id);
        showAlert(
          'Rappel activé ✅',
          `Vous serez notifié 30 min avant le départ de ${race.raceName}.`
        );
      } else {
        showAlert('Impossible', 'La course a déjà commencé ou les notifications sont désactivées.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.round}>Round {race.round}</Text>
          <Text style={styles.raceName} numberOfLines={1}>{race.raceName}</Text>
        </View>
        {status === 'upcoming' && (
          <TouchableOpacity onPress={handleNotification} style={styles.notifBtn}>
            <Ionicons
              name={notifId ? 'notifications' : 'notifications-outline'}
              size={22}
              color={notifId ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Race Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Circuit</Text>
              <Text style={styles.infoValue}>{race.Circuit.circuitName}</Text>
              <Text style={styles.infoSub}>{race.Circuit.Location.locality}, {race.Circuit.Location.country}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
              {race.time && (
                <Text style={styles.infoSub}>
                  {raceDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} heure locale
                </Text>
              )}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons
              name={status === 'live' ? 'radio' : status === 'finished' ? 'checkmark-circle' : 'time'}
              size={16}
              color={status === 'live' ? colors.green : status === 'finished' ? colors.textMuted : colors.orange}
            />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Statut</Text>
              <Text style={[
                styles.infoValue,
                { color: status === 'live' ? colors.green : status === 'finished' ? colors.textMuted : colors.text }
              ]}>
                {status === 'live' ? '● En direct' : status === 'finished' ? 'Terminé' : 'À venir'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          <CircuitMap circuitId={race.Circuit.circuitId} />
        </View>

        {/* Results Section */}
        {status === 'finished' && (
          <>
            {loading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des résultats...</Text>
              </View>
            ) : (
              <>
                {/* Tabs */}
                <View style={styles.tabs}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'race' && styles.tabActive]}
                    onPress={() => setActiveTab('race')}
                  >
                    <Text style={[styles.tabText, activeTab === 'race' && styles.tabTextActive]}>
                      Course
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'qualifying' && styles.tabActive]}
                    onPress={() => setActiveTab('qualifying')}
                  >
                    <Text style={[styles.tabText, activeTab === 'qualifying' && styles.tabTextActive]}>
                      Qualifications
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeTab === 'race' ? (
                  <>
                    {raceResults.length > 0 ? (
                      <>
                        <RacePodium results={raceResults} />
                        <RaceResultsTable results={raceResults} />
                      </>
                    ) : (
                      <Text style={styles.noData}>Résultats non disponibles</Text>
                    )}
                  </>
                ) : (
                  <>
                    {qualResults.length > 0 ? (
                      <>
                        <QualifyingPodium results={qualResults} />
                        <QualifyingResultsTable results={qualResults} />
                      </>
                    ) : (
                      <Text style={styles.noData}>Résultats non disponibles</Text>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {status === 'upcoming' && (
          <UpcomingBanner
            raceDate={raceDate}
            notifId={notifId}
            onNotification={handleNotification}
          />
        )}

        {status === 'live' && (
          <>
            <View style={styles.liveBanner}>
              <View style={styles.livePulse} />
              <Text style={styles.liveText}>● COURSE EN DIRECT</Text>
            </View>
            <LiveRaceStats raceDate={race.date} raceTime={race.time} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  round: {
    color: colors.primary,
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 1,
  },
  raceName: {
    color: colors.text,
    ...typography.h3,
  },
  notifBtn: {
    padding: spacing.xs,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textMuted,
    ...typography.small,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.text,
    ...typography.body,
    fontWeight: '600',
  },
  infoSub: {
    color: colors.textSecondary,
    ...typography.caption,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
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
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    ...typography.body,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
  },
  centered: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    ...typography.body,
  },
  noData: {
    color: colors.textSecondary,
    ...typography.body,
    textAlign: 'center',
    padding: spacing.xl,
  },
  upcomingBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  upcomingTitle: {
    color: colors.text,
    ...typography.h2,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  countdownBlock: {
    alignItems: 'center',
    minWidth: 48,
  },
  countdownValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'] as any,
  },
  countdownLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  countdownSep: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 2,
    marginBottom: 14,
  },
  upcomingText: {
    color: colors.textSecondary,
    ...typography.body,
    textAlign: 'center',
  },
  notifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  notifButtonText: {
    color: colors.text,
    ...typography.body,
    fontWeight: '600',
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green + '22',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.green,
    gap: spacing.sm,
  },
  livePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  liveText: {
    color: colors.green,
    ...typography.h3,
    fontWeight: '700',
    letterSpacing: 1,
  },
  liveSubText: {
    color: colors.textSecondary,
    ...typography.body,
  },
});
