export type Theme = {
  background: string;
  foreground: string;
  primary: string;
  muted: string;
  mutedForeground: string;
  border: string;
};

export const lightTheme: Theme = {
  background: "#fff",
  foreground: "#2E2E2E",
  primary: "#01a552",
  muted: "#E5E7EB",
  mutedForeground: "#6B7280",
  border: "#E5E7EB",
};

export const darkTheme: Theme = {
  background: "#07080f",
  foreground: "#F5F5F5",
  primary: "#008338",
  muted: "#3A3A3A",
  mutedForeground: "#9CA3AF",
  border: "#3A3A3A",
};