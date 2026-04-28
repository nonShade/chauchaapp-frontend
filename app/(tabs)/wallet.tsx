import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';

export default function CartolaScreen() {
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Encabezado: Título y Botón Agregar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Libreta de Gastos</Text>
            <View style={styles.personalModeTag}>
              <Ionicons name="person-outline" size={12} color={APP_THEME.cards.balance.tagText} />
              <Text style={styles.personalModeText}>Modo personal</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={16} color={APP_THEME.components.tabs.activeText} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de Modo */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'individual' && styles.toggleActive]}
            onPress={() => setActiveTab('individual')}
          >
            <Ionicons
              name={activeTab === 'individual' ? "person" : "person-outline"}
              size={18}
              color={activeTab === 'individual' ? APP_THEME.components.tabs.activeText : APP_THEME.components.tabs.inactiveText}
            />
            <Text style={[
              styles.toggleText,
              { color: activeTab === 'individual' ? APP_THEME.components.tabs.activeText : APP_THEME.components.tabs.inactiveText }
            ]}>
              Individual
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'group' && styles.toggleActive]}
            onPress={() => setActiveTab('group')}
          >
            <Ionicons
              name={activeTab === 'group' ? "people" : "people-outline"}
              size={18}
              color={activeTab === 'group' ? APP_THEME.components.tabs.activeText : APP_THEME.components.tabs.inactiveText}
            />
            <Text style={[
              styles.toggleText,
              { color: activeTab === 'group' ? APP_THEME.components.tabs.activeText : APP_THEME.components.tabs.inactiveText }
            ]}>
              Casa González
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
    marginBottom: 8,
  },
  personalModeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.cards.balance.tagBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  personalModeText: {
    color: APP_THEME.cards.balance.tagText,
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.components.tabs.activeBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: APP_THEME.components.tabs.activeText,
    fontWeight: '600',
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: APP_THEME.components.tabs.inactiveBg,
    borderRadius: 16,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  toggleActive: {
    backgroundColor: APP_THEME.components.tabs.activeBg,
  },
  toggleText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});