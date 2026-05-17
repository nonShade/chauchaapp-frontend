import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { Tip } from '@/services/api/tips';

export default function TipCard({ tip }: { tip: Tip | null }) {
  return (
    <View style={{flexDirection: 'column', backgroundColor: APP_THEME.cards.tip.background, borderColor: APP_THEME.cards.tip.accent, borderRadius: 16, borderWidth: 1,}}>
      <Text style={[styles.title, { color: APP_THEME.cards.tip.accent, padding: 12, paddingLeft: 16, paddingRight: 16 }]}>Tip financiero del día</Text>
    <View style={[styles.container]}>
      <View style={[styles.iconContainer]}>
        <Ionicons name="bulb-outline" size={24} color={APP_THEME.cards.tip.accent} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: APP_THEME.cards.tip.text }]}>{tip?.title || '...'}</Text>
        <Text style={[styles.tipText, { color: APP_THEME.text.secondary }]}>{tip?.text || 'Lo sentimos, no pudimos encontrar el tip del día.'}</Text>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    marginHorizontal: 0,
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
