const lightTheme = {
  text: '#121212',
  background: '#F5F5F5',
  tint: '#1DB954',
  icon: '#666666',
  tabIconDefault: '#666666',
  tabIconSelected: '#1DB954',
  cardBg: '#FFFFFF',
  cardBg2: '#F0F0F0',
  greenPrimary: '#1DB954',
  greenDark: '#158A3B',
  greenAlpha: '#1DB95420',
  textPrimary: '#121212',
  textSecondary: '#666666',
  border: '#E0E0E0',
};

const darkTheme = {
  text: '#FFFFFF',
  background: '#0D0D0D',
  tint: '#1DB954',
  icon: '#A0A0A0',
  tabIconDefault: '#A0A0A0',
  tabIconSelected: '#1DB954',
  cardBg: '#1A1A1A',
  cardBg2: '#252525',
  greenPrimary: '#1DB954',
  greenDark: '#158A3B',
  greenAlpha: '#1DB95420',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: '#2A2A2A',
};

export const Colors = {
  ...darkTheme,
  light: lightTheme,
  dark: darkTheme,
};

export const Typography = {
  xs: 11, sm: 12, base: 14,
  md: 16, lg: 20, xl: 24, xxl: 28,
};

export const Fonts = {
  rounded: 'System',
  mono: 'System',
};
