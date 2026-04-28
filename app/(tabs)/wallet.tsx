import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import PersonalSummaryChart from '@/components/cartola/PersonalSummaryChart';
import MonthAccordion from '@/components/cartola/MonthAccordion';
import PersonalTotals from '@/components/cartola/PersonalTotals';
import CategoryExpenses from '@/components/cartola/CategoryExpenses';
import RecentTransactions from '@/components/cartola/RecentTransactions';

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

        {/* Tarjetas de Ingresos y Gastos */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: APP_THEME.cards.income.background, borderColor: APP_THEME.cards.income.border }]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="trending-up" size={16} color={APP_THEME.cards.income.text} />
              <Text style={[styles.summaryTitle, { color: APP_THEME.cards.income.text }]}>Ingresos</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: APP_THEME.cards.income.text }]}>$3.975.000</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: APP_THEME.cards.expense.background, borderColor: APP_THEME.cards.expense.border }]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="trending-down" size={16} color={APP_THEME.cards.expense.text} />
              <Text style={[styles.summaryTitle, { color: APP_THEME.cards.expense.text }]}>Gastos</Text>
            </View>
            <Text style={[styles.summaryAmount, { color: APP_THEME.cards.expense.text }]}>$3.402.000</Text>
          </View>
        </View>

        {/* Tarjeta de Balance Disponible */}
        <View style={[styles.balanceCard, { backgroundColor: APP_THEME.cards.balance.background, borderColor: APP_THEME.cards.balance.border }]}>
          <View style={styles.balanceContent}>
            <View style={styles.balanceTag}>
              <Ionicons name="person-outline" size={12} color={APP_THEME.cards.balance.tagText} />
              <Text style={styles.balanceTagText}>Personal</Text>
            </View>
            <Text style={styles.balanceAmount}>$573.000</Text>
            <Text style={styles.balanceSubtitle}>Balance disponible</Text>
          </View>
          <View style={[styles.walletIconContainer, { backgroundColor: APP_THEME.cards.balance.iconBg }]}>
            <Ionicons name="wallet-outline" size={28} color={APP_THEME.components.tabs.activeText} />
          </View>
        </View>

        {/* Tarjeta de Recomendación de Ahorro */}
        <View style={[styles.tipCard, { backgroundColor: APP_THEME.cards.tip.background, borderColor: APP_THEME.cards.tip.border }]}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="bulb-outline" size={20} color={APP_THEME.cards.tip.accent} />
          </View>
          <View style={styles.tipTextContainer}>
            <Text style={styles.tipTitle}>Recomendacion de ahorro</Text>
            <Text style={styles.tipDescription}>
              Segun la regla 50/30/20, deberias ahorrar <Text style={{ color: APP_THEME.cards.tip.accent, fontWeight: 'bold' }}>$795.000</Text> este mes (20% de tus ingresos).
            </Text>
          </View>
        </View>

        <PersonalSummaryChart />
        <MonthAccordion />
        <PersonalTotals />
        <CategoryExpenses />
        <RecentTransactions />

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
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  balanceContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  balanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.cards.balance.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
    gap: 4,
  },
  balanceTagText: {
    color: APP_THEME.cards.balance.tagText,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: APP_THEME.text.primary,
    marginBottom: 4,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
  },
  walletIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3F2113',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  tipDescription: {
    color: APP_THEME.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
