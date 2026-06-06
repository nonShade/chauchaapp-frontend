import React from 'react';
import { View, StyleSheet } from 'react-native';
import { APP_THEME } from '@/constants/themes';
import { SkeletonPulse } from '@/components/learn/SkeletonPulse';

function SkeletonLine({ width, height }: { width: string | number; height: number }) {
  return <View style={[styles.line, { width, height }]} />;
}

export function LearnModulesSkeleton() {
  return (
    <SkeletonPulse style={styles.container}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.row1}>
            <View style={styles.badge} />
            <View style={styles.time} />
            <View style={styles.arrow} />
          </View>

          <View style={styles.row2}>
            <SkeletonLine width="78%" height={18} />
            <SkeletonLine width="96%" height={12} />
            <SkeletonLine width="88%" height={12} />
          </View>

          <View style={styles.row3}>
            <View style={styles.metaPill} />
            <View style={[styles.metaPill, styles.metaPillAccent]} />
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
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 24,
    aspectRatio: 2,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    width: 72,
    height: 22,
    borderRadius: 8,
    backgroundColor: APP_THEME.card.border,
  },
  time: {
    width: 52,
    height: 14,
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
  },
  arrow: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: APP_THEME.card.border,
  },
  row2: {
    gap: 8,
  },
  line: {
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
  },
  row3: {
    flexDirection: 'row',
    gap: 12,
  },
  metaPill: {
    width: 86,
    height: 14,
    borderRadius: 999,
    backgroundColor: APP_THEME.card.border,
  },
  metaPillAccent: {
    width: 98,
  },
});