import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

type TipCardProps = {
  title?: string;
  text?: string;
  loading?: boolean;
};

export default function TipCard({
  title = 'Tip financiero del dia',
  text = '',
  loading = false,
}: TipCardProps) {
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: APP_THEME.cards.tip.background, borderColor: APP_THEME.cards.tip.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: APP_THEME.cards.tip.border }]}>
          <Ionicons name="bulb-outline" size={24} color={APP_THEME.cards.tip.accent} />
        </View>
        <View style={styles.contentContainer}>
          <View style={[styles.skeletonTitle, { backgroundColor: APP_THEME.card.border }]} />
          <View style={[styles.skeletonLine, { backgroundColor: APP_THEME.card.border }]} />
          <View style={[styles.skeletonLineShort, { backgroundColor: APP_THEME.card.border }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.cards.tip.background, borderColor: APP_THEME.cards.tip.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: APP_THEME.cards.tip.border }]}>
        <Ionicons name="bulb-outline" size={24} color={APP_THEME.cards.tip.accent} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: APP_THEME.cards.tip.text }]}>{title}</Text>
        <Text style={[styles.tipText, { color: APP_THEME.text.secondary }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 0,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
  },
  skeletonTitle: {
    height: 16,
    width: '72%',
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonLine: {
    height: 12,
    width: '100%',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonLineShort: {
    height: 12,
    width: '78%',
    borderRadius: 6,
  },
});
