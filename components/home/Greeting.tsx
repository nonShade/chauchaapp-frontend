import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function Greeting({ userName = 'Usuario' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, {userName}</Text>
      <Text style={styles.subtitle}>Tu resumen financiero de hoy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
