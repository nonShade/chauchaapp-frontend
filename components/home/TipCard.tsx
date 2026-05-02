import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

export default function TipCard({ tip = '', semana = '' }) {
  return (
    <View style={[styles.container, { backgroundColor: APP_THEME.cards.tip.background, borderColor: APP_THEME.cards.tip.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: APP_THEME.cards.tip.border }]}>
        <Ionicons name="bulb-outline" size={24} color={APP_THEME.cards.tip.accent} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: APP_THEME.cards.tip.text }]}>Tip financiero del dia</Text>
        <Text style={[styles.tipText, { color: APP_THEME.text.secondary }]}>{tip}</Text>
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
});
