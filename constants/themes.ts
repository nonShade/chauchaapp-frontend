export const APP_THEME = {
  background: {
    primary: "#06090f",
    overlay: "rgba(0,0,0,0.6)",
  },

  card: {
    background: "#10141b",
    border: "#252c38",
    progressBg: "#0D1117",
    // Quiz option states
    optionCorrectBg: "#111714",
    optionWrongBg: "#111714",
    // Progress track (dark bar background)
    progressTrackBg: "#1A1A1B",
    // Number badge (learn modal list)
    numberBadgeBg: "#0F2A1E",
  },

  text: {
    primary: "#eceff2",
    secondary: "#8c8f95",
    // Option letter inside unselected label
    optionLetter: "#93979F",
  },

  input: {
    background: "#1d2229",
    border: "#292e36",
    text: "#a6aab8",
    placeholder: "#a6aab8",
    // Option label chip (unselected)
    optionLabelBg: "#1A1E24",
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
    // Brighter red used in quiz wrong answers and progress fill
    danger: "#FF453A",
    success: "#00C853",
    // Brighter greens used in quiz correct answers, badges, and counters
    successBright: "#3FD364",
    successAlt: "#47D676",
    successMuted: "#2FE08F",
    // Quiz result banner green
    quizBannerBg: "#20A353",
    // Difficulty badge background (semi-transparent green)
    difficultyBadgeBg: "rgba(71, 214, 118, 0.15)",
    // Quiz icon circle background
    quizIconBg: "rgba(71, 214, 118, 0.15)",
    // Completed progress bar tint
    progressCompleteBg: "rgba(63, 211, 100, 0.2)",
    alerts: {
      errorBg: "#FFCCCC",
      errorText: "#CC0000",
      successBg: "#D4EDDA",
      successText: "#155724",
    },
  },

  notifications: {
    // Grupo
    groupBg: "#0a1912",
    groupBorder: "#0d2b1c",
    groupBadgeBg: "#0d2b1c",
    groupAccent: "#20a353",

    // Tips / educativos
    tipBg: "#10141b",
    tipBorder: "#292e36",
    tipBadgeBg: "#1d2229",
    tipAccent: "#ffffff",

    // Recordatorios
    reminderBg: "#ff98451a",
    reminderBorder: "#ff984540",
    reminderBadgeBg: "#ff984526",
    reminderAccent: "#ff9845",

    // Otras
    otherBg: "#0a1912",
    otherBorder: "#0d2b1c",
    otherBadgeBg: "#0d2b1c",
    otherAccent: "#00a3cd",

    // Texto
    messageText: "#8b8f95",
    textPrimary: "#f1f5f9",
    textSecondary: "#64748b",

    // Badge "Nuevo"
    newBadgeBg: "#0d2b1c",
    newBadgeText: "#20a353",

    // Bordes y fondo
    cardBorder: "#1e293b",
    background: "#06090f",

    // Estados especiales
    mutedText: "#94a3b8",
    declineBorder: "#334155",
    emptyIcon: "#475569",
    errorColor: "#ef4444",
    retryBg: "#1e293b",
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
      iconBg: "#3F2113",
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
      background: "#0f1419",
      border: "#3CA5FF",
      tagBg: "#113255",
      tagText: "#3CA5FF",
      iconBg: "#3CA5FF",
    },
    groupBalance: {
      background: "#0f1419",
      border: "#FF8A4C",
      tagBg: "#3D2415",
      tagText: "#FF8A4C",
      iconBg: "#FF8A4C",
    },
    categories: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
  },

  group: {
    primary: "#FF8A4C",
    primaryText: "#000000",
    modeTagBg: "#3D2415",
    modeTagText: "#FF8A4C",
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
  xs:      11,
  sm:      12,
  hint:    13,
  base:    14,
  label:   15,
  md:      16,
  subhead: 17,
  body:    18,
  lg:      20,
  title:   22,
  xl:      24,
  xxl:     28,
  // Display sizes — used sparingly for result screens
  display: 48,
  hero:    56,
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