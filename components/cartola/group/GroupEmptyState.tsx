import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

export default function GroupEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="people" size={48} color={APP_THEME.group.primary} />
      </View>
      <Text style={styles.title}>Cartola de Grupo Familiar</Text>
      <Text style={styles.description}>
        Lleva un registro compartido de gastos e ingresos con tu familia. 
        Actualmente no perteneces a ningún grupo familiar.
      </Text>
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={APP_THEME.text.secondary} />
        <Text style={styles.infoText}>
          Ve a tu Perfil para crear un grupo o pedirle a un familiar que te invite al suyo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_THEME.cards.expense.border,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: APP_THEME.group.modeTagBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.components.tabs.inactiveBg,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: APP_THEME.text.secondary,
    lineHeight: 20,
  },
});
