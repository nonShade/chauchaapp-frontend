import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from './themes';

export type ColorScheme = 'light' | 'dark';

export let globalOverride: ColorScheme | null = null;
const listeners = new Set<() => void>();

export function toggleThemeOverride(currentScheme: ColorScheme) {
  globalOverride = currentScheme === 'dark' ? 'light' : 'dark';
  listeners.forEach((l) => l());
}

export function useThemeCs(): Theme {
  const systemScheme = useColorScheme();
  const [, forceRender] = useState(0);

  useState(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  });

  const scheme = globalOverride ?? systemScheme ?? 'light';
  return scheme === 'dark' ? darkTheme : lightTheme;
}