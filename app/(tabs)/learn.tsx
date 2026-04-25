import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function AprenderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Aprender</Text>
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
