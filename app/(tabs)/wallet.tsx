import { View, Text, StyleSheet } from 'react-native';
import { APP_THEME } from '@/constants/themes';

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
    backgroundColor: APP_THEME.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: APP_THEME.text.primary,
    fontSize: 18,
  },
});
