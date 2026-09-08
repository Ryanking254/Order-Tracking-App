export const colors = {
  primary: '#1BA34A',
  primaryDark: '#14803C',
  primarySoft: '#E7F6EC',
  ink: '#101828',
  muted: '#6B7280',
  faint: '#98A2B3',
  bg: '#F3F4F6',
  card: '#FFFFFF',
  border: '#E9EAF0',
  input: '#F2F3F5',
  star: '#F5A623',
  dark: '#111111',
  mapBg: '#E9EDE6',
  mapRoad: '#FFFFFF',
  mapWater: '#C9DFF2',
  mapPark: '#D9EAD3',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#101828',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pin: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  tab: {
    shadowColor: '#101828',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
};

export const paperTheme = {
  colors: {
    primary: colors.primary,
    secondary: colors.ink,
  },
  roundness: 14,
};
