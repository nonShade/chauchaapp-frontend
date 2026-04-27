import { TouchableOpacity, useColorScheme } from 'react-native';
import { useThemeCs, toggleThemeOverride, globalOverride, ColorScheme } from '@/components/colors/themeDetector';
import Ionicons from '@expo/vector-icons/Ionicons';

export function ThemeToggle() {
  const theme = useThemeCs();
  const systemScheme = useColorScheme() ?? 'light';
  const current = (globalOverride ?? systemScheme) as ColorScheme;

  return (
    <TouchableOpacity
      onPress={() => toggleThemeOverride(current)}
      style={{
        width: 44,
        height: 44,
        borderRadius: 100,
        backgroundColor: theme.muted,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons
        name={current === 'dark' ? 'sunny' : 'moon'}
        size={22}
        color={theme.foreground}
      />
    </TouchableOpacity>
  );
}