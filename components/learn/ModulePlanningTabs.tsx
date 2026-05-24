import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

type LearnTab = 'modules' | 'planning';

type ModulePlanningTabsProps = {
  value: LearnTab;
  onChange: (next: LearnTab) => void;
};

export default function ModulePlanningTabs({ value, onChange }: ModulePlanningTabsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.tab, value === 'modules' ? styles.tabActive : styles.tabInactive]}
        onPress={() => onChange('modules')}
      >
        <Ionicons
          name="school-outline"
          size={16}
          color={value === 'modules' ? APP_THEME.text.primary : APP_THEME.text.secondary}
        />
        <Text style={[styles.tabText, value === 'modules' ? styles.textActive : styles.textInactive]}>
          Modulos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.tab, value === 'planning' ? styles.tabActive : styles.tabInactive]}
        onPress={() => onChange('planning')}
      >
        <Ionicons
          name="calendar-outline"
          size={16}
          color={value === 'planning' ? APP_THEME.text.primary : APP_THEME.text.secondary}
        />
        <Text style={[styles.tabText, value === 'planning' ? styles.textActive : styles.textInactive]}>
          Planificacion
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 14,
    padding: 6,
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: '#1e242e',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textActive: {
    color: APP_THEME.text.primary,
  },
  textInactive: {
    color: APP_THEME.text.secondary,
  },
});
