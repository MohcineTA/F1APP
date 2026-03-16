export const colors = {
  background: '#0A0F1F',         // Modern dark blue-gray
  surface: '#141B2D',            // Elevated dark surface with blue tint
  surfaceElevated: '#1E2942',    // Light elevated with more blue
  border: '#2A3550',             // Modern blue-gray border
  primary: '#E8002D',            // F1 red (unchanged)
  primaryDark: '#B30024',        // F1 dark red
  accent: '#0EA5E9',             // Cyan accent for modern feel
  text: '#F8FAFC',               // Slightly warmer white
  textSecondary: '#A0AEC0',      // Modern gray
  textMuted: '#64748B',          // Slate gray
  gold: '#FCD34D',               // Warmer gold
  silver: '#D1D5DB',             // Modern silver
  bronze: '#F59E0B',             // Modern bronze/amber
  green: '#10B981',              // Modern green
  orange: '#F97316',             // Modern vibrant orange
  tabBar: '#0F1419',             // Darker tab bar for contrast
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '400' as const },
};
