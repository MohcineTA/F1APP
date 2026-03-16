import { Race, QualifyingResult, RaceResult } from '../types';

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';
const OPENF1_BASE = 'https://api.openf1.org/v1';

// ─── OpenF1 Types ────────────────────────────────────────────────────────────
export interface LiveDriver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
}

export interface LivePosition {
  driver_number: number;
  position: number;
  date: string;
}

export interface LiveInterval {
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
  date: string;
}

export interface LiveLap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  date_start: string;
}

export interface LiveStint {
  driver_number: number;
  compound: string;
  lap_start: number;
  lap_end: number | null;
  tyre_age_at_start: number;
}

export interface LiveDriverStats {
  driver: LiveDriver;
  position: number;
  gap_to_leader: string;
  interval: string;
  last_lap: string;
  lap_number: number;
  compound: string;
  tyre_age: number;
}

// ─── OpenF1 API calls ─────────────────────────────────────────────────────────

export async function getLiveSessionKey(): Promise<number | null> {
  try {
    const res = await fetch(`${OPENF1_BASE}/sessions?session_name=Race&year=${new Date().getFullYear()}`);
    const data = await res.json();
    if (!data.length) return null;
    // Return the most recent session
    const sorted = data.sort((a: any, b: any) =>
      new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );
    return sorted[0].session_key;
  } catch { return null; }
}

export async function getLiveDrivers(sessionKey: number): Promise<LiveDriver[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/drivers?session_key=${sessionKey}`);
    return await res.json();
  } catch { return []; }
}

export async function getLivePositions(sessionKey: number): Promise<LivePosition[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/position?session_key=${sessionKey}`);
    const all: LivePosition[] = await res.json();
    // Keep only the latest position per driver
    const map = new Map<number, LivePosition>();
    all.forEach(p => {
      const existing = map.get(p.driver_number);
      if (!existing || new Date(p.date) > new Date(existing.date)) {
        map.set(p.driver_number, p);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.position - b.position);
  } catch { return []; }
}

export async function getLiveIntervals(sessionKey: number): Promise<LiveInterval[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/intervals?session_key=${sessionKey}`);
    const all: LiveInterval[] = await res.json();
    const map = new Map<number, LiveInterval>();
    all.forEach(i => {
      const existing = map.get(i.driver_number);
      if (!existing || new Date(i.date) > new Date(existing.date)) {
        map.set(i.driver_number, i);
      }
    });
    return Array.from(map.values());
  } catch { return []; }
}

export async function getLiveLastLaps(sessionKey: number): Promise<LiveLap[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/laps?session_key=${sessionKey}`);
    const all: LiveLap[] = await res.json();
    const map = new Map<number, LiveLap>();
    all.forEach(l => {
      const existing = map.get(l.driver_number);
      if (!existing || l.lap_number > existing.lap_number) {
        map.set(l.driver_number, l);
      }
    });
    return Array.from(map.values());
  } catch { return []; }
}

export async function getLiveStints(sessionKey: number): Promise<LiveStint[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/stints?session_key=${sessionKey}`);
    const all: LiveStint[] = await res.json();
    // Keep latest stint per driver
    const map = new Map<number, LiveStint>();
    all.forEach(s => {
      const existing = map.get(s.driver_number);
      if (!existing || s.lap_start > existing.lap_start) {
        map.set(s.driver_number, s);
      }
    });
    return Array.from(map.values());
  } catch { return []; }
}

export async function getLiveRaceStats(sessionKey: number): Promise<LiveDriverStats[]> {
  const [drivers, positions, intervals, laps, stints] = await Promise.all([
    getLiveDrivers(sessionKey),
    getLivePositions(sessionKey),
    getLiveIntervals(sessionKey),
    getLiveLastLaps(sessionKey),
    getLiveStints(sessionKey),
  ]);

  return positions.map((pos) => {
    const driver = drivers.find(d => d.driver_number === pos.driver_number) || {
      driver_number: pos.driver_number,
      full_name: `#${pos.driver_number}`,
      name_acronym: `${pos.driver_number}`,
      team_name: '',
      team_colour: '#FFFFFF',
    };
    const interval = intervals.find(i => i.driver_number === pos.driver_number);
    const lap = laps.find(l => l.driver_number === pos.driver_number);
    const stint = stints.find(s => s.driver_number === pos.driver_number);

    const formatTime = (sec: number | null | undefined): string => {
      if (!sec) return '—';
      const m = Math.floor(sec / 60);
      const s = (sec % 60).toFixed(3).padStart(6, '0');
      return m > 0 ? `${m}:${s}` : `${s}`;
    };

    const formatGap = (gap: number | null | undefined): string => {
      if (gap === null || gap === undefined) return '—';
      if (gap === 0) return 'LEADER';
      return `+${gap.toFixed(3)}`;
    };

    return {
      driver,
      position: pos.position,
      gap_to_leader: formatGap(interval?.gap_to_leader),
      interval: formatGap(interval?.interval),
      last_lap: formatTime(lap?.lap_duration),
      lap_number: lap?.lap_number || 0,
      compound: stint?.compound || '?',
      tyre_age: (stint ? (lap?.lap_number || 0) - stint.lap_start + (stint.tyre_age_at_start || 0) : 0),
    };
  });
}

export async function getDriverHeadshots(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${OPENF1_BASE}/drivers?session_key=latest`);
    const drivers: { name_acronym: string; headshot_url: string }[] = await res.json();
    const map: Record<string, string> = {};
    drivers.forEach(d => {
      if (d.name_acronym && d.headshot_url) {
        map[d.name_acronym] = d.headshot_url;
      }
    });
    return map;
  } catch { return {}; }
}

export function getTyreColor(compound: string): string {
  const map: Record<string, string> = {
    'SOFT': '#E8002D',
    'MEDIUM': '#FFF200',
    'HARD': '#FFFFFF',
    'INTERMEDIATE': '#43B02A',
    'WET': '#0067FF',
  };
  return map[compound?.toUpperCase()] || '#888';
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function getCurrentSeasonRaces(): Promise<Race[]> {
  try {
    const data = await fetchJson(`${ERGAST_BASE}/current.json?limit=30`);
    return data.MRData.RaceTable.Races as Race[];
  } catch (e) {
    console.error('Error fetching races:', e);
    return [];
  }
}

export async function getRaceResults(season: string, round: string): Promise<RaceResult[]> {
  try {
    const data = await fetchJson(`${ERGAST_BASE}/${season}/${round}/results.json`);
    const races = data.MRData.RaceTable.Races;
    if (races.length === 0) return [];
    return races[0].Results as RaceResult[];
  } catch (e) {
    console.error('Error fetching race results:', e);
    return [];
  }
}

export async function getQualifyingResults(season: string, round: string): Promise<QualifyingResult[]> {
  try {
    const data = await fetchJson(`${ERGAST_BASE}/${season}/${round}/qualifying.json`);
    const races = data.MRData.RaceTable.Races;
    if (races.length === 0) return [];
    return races[0].QualifyingResults as QualifyingResult[];
  } catch (e) {
    console.error('Error fetching qualifying results:', e);
    return [];
  }
}

export function getRaceStatus(race: Race): 'upcoming' | 'live' | 'finished' {
  const now = new Date();
  const raceDateTime = race.time
    ? new Date(`${race.date}T${race.time}`)
    : new Date(`${race.date}T13:00:00Z`);

  const raceEnd = new Date(raceDateTime.getTime() + 2 * 60 * 60 * 1000); // +2h

  if (now < raceDateTime) return 'upcoming';
  if (now >= raceDateTime && now <= raceEnd) return 'live';
  return 'finished';
}

export function getNextRace(races: Race[]): Race | null {
  const now = new Date();
  const upcoming = races.filter((r) => {
    const d = new Date(`${r.date}T${r.time || '13:00:00Z'}`);
    return d > now;
  });
  return upcoming.length > 0 ? upcoming[0] : null;
}

export function getTeamColor(constructorName: string): string {
  const colors: Record<string, string> = {
    'Red Bull': '#1E3A8A',        // bleu foncé
    'Ferrari': '#DC2626',          // rouge vif
    'Mercedes': '#0EA5E9',         // cyan/bleu ciel
    'McLaren': '#FF8000',          // orange (identique)
    'Aston Martin': '#16A34A',     // vert émeraude
    'Alpine': '#A855F7',           // violet/magenta
    'Williams': '#0369A1',         // bleu océan
    'RB': '#06B6D4',               // cyan turquoise
    'Kick Sauber': '#84CC16',      // lime vert
    'Haas': '#8B5CF6',             // violet indigo
    'Audi': '#E31937',             // rouge Audi
    'Cadillac F1 Team': '#FFB81C', // or/jaune Cadillac
  };
  return colors[constructorName] || '#64748B';
}

export function getConstructorLogoUrl(constructorName: string): string | null {
  // F1 official CDN — lowercase slugs, no file extension (Cloudinary auto-detects)
  const CDN = 'https://media.formula1.com/image/upload/f_auto,c_limit,q_75,w_200/content/dam/fom-website/2018-redesign-assets/team%20logos';
  const logos: Record<string, string | null> = {
    'Red Bull': `${CDN}/red%20bull`,
    'Ferrari': `${CDN}/ferrari`,
    'Mercedes': `${CDN}/mercedes`,
    'McLaren': `${CDN}/mclaren`,
    'Aston Martin': `${CDN}/aston%20martin`,
    'Alpine': `${CDN}/alpine`,
    'Alpine F1 Team': `${CDN}/alpine`,
    'Williams': `${CDN}/williams`,
    'Haas': `${CDN}/haas`,
    'Haas F1 Team': `${CDN}/haas`,
    'Kick Sauber': `${CDN}/kick%20sauber`,
    'RB': `${CDN}/rb`,
    'RB F1 Team': `${CDN}/rb`,
    'Audi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Audif1.com_logo17_%28cropped%29.svg/512px-Audif1.com_logo17_%28cropped%29.svg.png',
    'Cadillac F1 Team': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Cadillac_Formula_1_Team_logo.png/512px-Cadillac_Formula_1_Team_logo.png',
  };
  return logos[constructorName] ?? null;
}

export function getFlagEmoji(nationality: string): string {
  const flags: Record<string, string> = {
    // Nationalities (for drivers)
    'British': '🇬🇧', 'German': '🇩🇪', 'Spanish': '🇪🇸', 'Finnish': '🇫🇮',
    'French': '🇫🇷', 'Dutch': '🇳🇱', 'Mexican': '🇲🇽', 'Monegasque': '🇲🇨',
    'Australian': '🇦🇺', 'Canadian': '🇨🇦', 'Japanese': '🇯🇵', 'Thai': '🇹🇭',
    'Chinese': '🇨🇳', 'Danish': '🇩🇰', 'American': '🇺🇸', 'Italian': '🇮🇹',
    'Brazilian': '🇧🇷', 'Argentine': '🇦🇷', 'Austrian': '🇦🇹', 'Russian': '🇷🇺',
    'New Zealander': '🇳🇿', 'Belgian': '🇧🇪', 'Swiss': '🇨🇭', 'Portuguese': '🇵🇹',
    'South Korean': '🇰🇷', 'Polish': '🇵🇱', 'Indian': '🇮🇳',
    // Country names — includes both full names and Ergast API abbreviations
    'Australia': '🇦🇺', 'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦', 'Japan': '🇯🇵',
    'China': '🇨🇳', 'United States': '🇺🇸', 'USA': '🇺🇸', 'Italy': '🇮🇹',
    'Monaco': '🇲🇨', 'Canada': '🇨🇦', 'Spain': '🇪🇸', 'Austria': '🇦🇹',
    'United Kingdom': '🇬🇧', 'UK': '🇬🇧', 'Belgium': '🇧🇪', 'Netherlands': '🇳🇱',
    'Hungary': '🇭🇺', 'Singapore': '🇸🇬', 'Azerbaijan': '🇦🇿', 'Mexico': '🇲🇽',
    'Brazil': '🇧🇷', 'UAE': '🇦🇪', 'Qatar': '🇶🇦', 'France': '🇫🇷',
    'Germany': '🇩🇪', 'Portugal': '🇵🇹', 'Turkey': '🇹🇷', 'Russia': '🇷🇺',
    'South Africa': '🇿🇦', 'India': '🇮🇳', 'Malaysia': '🇲🇾', 'South Korea': '🇰🇷',
    'Switzerland': '🇨🇭', 'Thailand': '🇹🇭', 'Denmark': '🇩🇰',
  };
  return flags[nationality] || '🏁';
}

// Returns ISO 3166-1 alpha-2 code for a country or nationality
export function getCountryCode(countryOrNationality: string): string | null {
  const codes: Record<string, string> = {
    // Country names (Ergast API)
    'Australia': 'au', 'Bahrain': 'bh', 'Saudi Arabia': 'sa', 'Japan': 'jp',
    'China': 'cn', 'United States': 'us', 'USA': 'us', 'Italy': 'it',
    'Monaco': 'mc', 'Canada': 'ca', 'Spain': 'es', 'Austria': 'at',
    'United Kingdom': 'gb', 'UK': 'gb', 'Belgium': 'be', 'Netherlands': 'nl',
    'Hungary': 'hu', 'Singapore': 'sg', 'Azerbaijan': 'az', 'Mexico': 'mx',
    'Brazil': 'br', 'UAE': 'ae', 'Qatar': 'qa', 'France': 'fr',
    'Germany': 'de', 'Portugal': 'pt', 'Turkey': 'tr', 'Russia': 'ru',
    'South Africa': 'za', 'India': 'in', 'Malaysia': 'my', 'South Korea': 'kr',
    'Switzerland': 'ch', 'Thailand': 'th', 'Denmark': 'dk',
    // Nationalities
    'British': 'gb', 'German': 'de', 'Spanish': 'es', 'Finnish': 'fi',
    'French': 'fr', 'Dutch': 'nl', 'Mexican': 'mx', 'Monegasque': 'mc',
    'Australian': 'au', 'Canadian': 'ca', 'Japanese': 'jp', 'Thai': 'th',
    'Chinese': 'cn', 'Danish': 'dk', 'American': 'us', 'Italian': 'it',
    'Brazilian': 'br', 'Argentine': 'ar', 'Austrian': 'at', 'Russian': 'ru',
    'New Zealander': 'nz', 'Belgian': 'be', 'Swiss': 'ch', 'Portuguese': 'pt',
    'South Korean': 'kr', 'Polish': 'pl', 'Indian': 'in',
  };
  return codes[countryOrNationality] || null;
}

// Returns a flag image URL from flagcdn.com (reliable PNG flags)
export function getCountryFlagUrl(countryOrNationality: string, width: number = 40): string | null {
  const code = getCountryCode(countryOrNationality);
  if (!code) return null;
  return `https://flagcdn.com/w${width}/${code}.png`;
}
