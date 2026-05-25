import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { FinancialPlanningTip } from '@/types/planningTypes';

type PlanningCardProps = {
  tip: FinancialPlanningTip;
  onPress: () => void;
};

const CATEGORY_STYLES: Record<string, { badgeBg: string; badgeText: string; iconBg: string; icon: keyof typeof Ionicons.glyphMap }>
= {
  emergencia: { badgeBg: '#2A1518', badgeText: '#FF5C6A', iconBg: '#13221B', icon: 'shield-checkmark-outline' },
  metas: { badgeBg: '#112720', badgeText: '#2FE08F', iconBg: '#142420', icon: 'locate-outline' },
  deudas: { badgeBg: '#2A1B12', badgeText: '#FF9B4A', iconBg: '#1E1713', icon: 'trending-down-outline' },
  presupuesto: { badgeBg: '#12212F', badgeText: '#54B3FF', iconBg: '#141B23', icon: 'wallet-outline' },
  retiro: { badgeBg: '#1D2030', badgeText: '#9EA8FF', iconBg: '#191C26', icon: 'leaf-outline' },
  inversion: { badgeBg: '#1E1B2A', badgeText: '#C58BFF', iconBg: '#1A1724', icon: 'pulse-outline' },
};

const DEFAULT_STYLE = {
  badgeBg: '#1F2430',
  badgeText: '#9AA3B2',
  iconBg: '#151A22',
  icon: 'reader-outline' as const,
};

export default function PlanningCard({ tip, onPress }: PlanningCardProps) {
  const categoryKey = tip.category?.toLowerCase?.() ?? '';
  const categoryStyle = CATEGORY_STYLES[categoryKey] ?? DEFAULT_STYLE;
  const pointCount = tip.keyPoints?.length ?? 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: categoryStyle.iconBg }]}>
          <Ionicons name={categoryStyle.icon} size={20} color={categoryStyle.badgeText} />
        </View>
        <View style={styles.titleColumn}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.badgeBg }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.badgeText }]}>
              {capitalizeLabel(categoryKey)}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {tip.title}
          </Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={3}>
        {tip.description}
      </Text>
      <View style={styles.pointsRow}>
        <Text style={styles.pointsText}>{pointCount} puntos clave</Text>
        <Ionicons name="chevron-forward" size={16} color={APP_THEME.button.primary.background} />
      </View>
    </TouchableOpacity>
  );
}

const capitalizeLabel = (value: string) => {
  if (!value) return 'General';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleColumn: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsText: {
    color: APP_THEME.button.primary.background,
    fontSize: 13,
    fontWeight: '600',
  },
});
