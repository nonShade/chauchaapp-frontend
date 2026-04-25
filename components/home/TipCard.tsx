import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TipCard({ tip = '', semana = '' }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="bulb-outline" size={24} color="#F97316" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Tip financiero del dia</Text>
        <Text style={styles.tipText}>{tip}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A1610',
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A2A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 22,
  },
});
