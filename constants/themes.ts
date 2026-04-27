export const APP_THEME = {
  background: {
    primary: "#06090f",
  },

  card: {
    background: "#10141b",
    border: "#252c38",
  },

  text: {
    primary: "#eceff2",
    secondary: "#8c8f95",
  },

  input: {
    background: "#1d2229",
    border: "#292e36",
    text: "#a6aab8",
    placeholder: "#a6aab8",
  },

  button: {
    primary: {
      background: "#00a452",
      text: "#020803",
    },
  },

  status: {
    error: "#ee343b",
  },

  semantic: {
    link: "#10b981",
  },

  cards: {
    news: {
      background: "#0f1419",
      border: "#1a3a35",
      text: "#eceff2",
      accent: "#00a452",
    },
    tip: {
      background: "#1f140d",
      border: "#4a2a1a",
      text: "#eceff2",
      accent: "#F97316",
    },
  },
};

export const Typography = {
  xs: 11, 
  sm: 12, 
  base: 14,
  md: 16, 
  lg: 20, 
  xl: 24, 
  xxl: 28,
};

export const Fonts = {
  rounded: 'System',
  mono: 'System',
};

export const LOGIN_THEME = APP_THEME;

export const THEME = {
  colors: {
    ...APP_THEME,
  },
};

export default APP_THEME;
