import React from 'react';
import { View, StyleSheet } from 'react-native';
import { APP_THEME } from '@/constants/themes';
import { SkeletonPulse } from '@/components/learn/SkeletonPulse';

export function PlanningSkeleton() {
  return (
    <SkeletonPulse style={styles.container}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap} />
            <View style={styles.titleColumn}>
              <View style={styles.badge} />
              <View style={styles.title} />
            </View>
          </View>
          <View style={styles.line} />
          <View style={styles.lineShort} />
          <View style={styles.pointsRow}>
            <View style={styles.pointsText} />
            <View style={styles.chevron} />
          </View>
        </View>
      ))}
    </SkeletonPulse>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1A212B',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: APP_THEME.card.border,
  },
  titleColumn: {
    flex: 1,
    gap: 8,
  },
  badge: {
    width: 72,
    height: 20,
    borderRadius: 999,
    backgroundColor: APP_THEME.card.border,
  },
  title: {
    height: 18,
    width: '82%',
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
  },
  line: {
    height: 12,
    width: '100%',
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
    marginBottom: 8,
  },
  lineShort: {
    height: 12,
    width: '84%',
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
    marginBottom: 14,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsText: {
    width: 92,
    height: 12,
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
  },
  chevron: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: APP_THEME.card.border,
  },
});