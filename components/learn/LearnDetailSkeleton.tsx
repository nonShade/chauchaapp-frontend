import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { APP_THEME } from '@/constants/themes';
import { SkeletonPulse } from '@/components/learn/SkeletonPulse';

function SkeletonLine({ width, height }: { width: DimensionValue; height: number }) {
  return <View style={[styles.line, { width, height }]} />;
}

export function LearnDetailSkeleton() {
  return (
    <SkeletonPulse style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.backButton} />
        <View style={styles.progressBadge} />
      </View>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.content}>
        <View style={styles.badge} />
        <SkeletonLine width="82%" height={28} />
        <View style={styles.metaRow}>
          <View style={styles.metaItem} />
          <View style={styles.metaItemShort} />
        </View>

        <View style={styles.sectionBlock}>
          <SkeletonLine width="58%" height={18} />
          <SkeletonLine width="100%" height={14} />
          <SkeletonLine width="95%" height={14} />
          <SkeletonLine width="88%" height={14} />
        </View>

        <View style={styles.sectionBlock}>
          <SkeletonLine width="48%" height={18} />
          <SkeletonLine width="100%" height={14} />
          <SkeletonLine width="90%" height={14} />
          <SkeletonLine width="86%" height={14} />
        </View>
      </View>
    </SkeletonPulse>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 148,
    height: 34,
    borderRadius: 10,
    backgroundColor: APP_THEME.card.border,
  },
  progressBadge: {
    width: 64,
    height: 28,
    borderRadius: 999,
    backgroundColor: APP_THEME.card.border,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: APP_THEME.card.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: APP_THEME.button.primary.background,
  },
  content: {
    gap: 18,
  },
  badge: {
    width: 86,
    height: 24,
    borderRadius: 999,
    backgroundColor: APP_THEME.card.border,
  },
  line: {
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    width: 120,
    height: 18,
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
  },
  metaItemShort: {
    width: 96,
    height: 18,
    borderRadius: 6,
    backgroundColor: APP_THEME.card.border,
  },
  sectionBlock: {
    gap: 10,
    paddingTop: 4,
  },
});