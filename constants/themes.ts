export const APP_THEME = {
  background: {
    primary: "#06090f",
  },

  card: {
    background: "#10141b",
    border: "#252c38",
    progressBg: "#0D1117",
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
      textTransparent: "#02080320",
    },
  },

  status: {
    error: "#ee343b",
    success: "#00C853",
    alerts: {
      errorBg: "#FFCCCC",
      errorText: "#CC0000",
      successBg: "#D4EDDA",
      successText: "#155724",
    }
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
      background: "#1A110B",
      border: "#3F2113",
      text: "#eceff2",
      accent: "#E97D21",
    },
    income: {
      background: "#081B13",
      border: "#0A331D",
      text: "#00C853",
      amountText: "#b9d7c4",
    },
    expense: {
      background: "#1F0A0E",
      border: "#3D1318",
      text: "#FF453A",
      amountText: "#f8cfc9",
    },
    balance: {
      background: "#0F1C2E",
      border: "#295D99",
      tagBg: "#113255",
      tagText: "#3CA5FF",
      iconBg: "#3CA5FF",
    },
    categories: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
  },

  components: {
    tabs: {
      activeBg: "#3CA5FF",
      activeText: "#06090f",
      inactiveBg: "#1D232C",
      inactiveText: "#8c8f95",
    },
    badge: {
      background: "#ee343b",
      text: "#FFFFFF",
    }
  }
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
