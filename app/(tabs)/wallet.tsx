import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function CartolaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Cartola</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 18,
  },
});
