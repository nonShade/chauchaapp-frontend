import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import Greeting from '@/components/home/Greeting';
import NewsCard from '@/components/home/NewsCard';
import TipCard from '@/components/home/TipCard';

const formatCLP = (amount: number) => `$${amount.toLocaleString('es-CL')}`;

export default function HomeScreen() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);

  const balance = 573000;
  const ingresos = 3975000;
  const gastos = 3402000;
  const news = {
    title: 'El cobre experimenta una leve alza',
    summary: 'Los mercados reaccionan positivamente a las noticias desde Asia, impulsando el precio.',
    affectsLabel: 'Impacto Positivo',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Greeting userName='Usuario' />

        {/* Balance Integrado */}
        <View style={styles.balanceContainer}>
          <View style={styles.topSection}>
            <View style={styles.row}>
              <View style={styles.titleRow}>
                <Ionicons name="sparkles-outline" size={18} color="#000" />
                <Text style={styles.balanceLabel}>Balance disponible</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeIcon}>
                <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {showBalance ? formatCLP(balance) : '••••••••'}
            </Text>
          </View>

          <View style={styles.middleSection}>
            <View style={styles.col}>
              <View style={styles.iconBg}>
                <Ionicons name="trending-up" size={16} color="#000" />
              </View>
              <View>
                <Text style={styles.colLabel}>Ingresos</Text>
                <Text style={styles.colAmount}>
                  {showBalance ? formatCLP(ingresos) : '••••'}
                </Text>
              </View>
            </View>
            <View style={styles.col}>
              <View style={styles.iconBg}>
                <Ionicons name="trending-down" size={16} color="#000" />
              </View>
              <View>
                <Text style={styles.colLabel}>Gastos</Text>
                <Text style={styles.colAmount}>
                  {showBalance ? formatCLP(gastos) : '••••'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)/wallet' as any)}
            >
              <Text style={styles.buttonText}>Ver detalle completo</Text>
              <Ionicons name="arrow-up" size={16} color="#000" style={{ transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
          </View>
        </View>

        <NewsCard
          data={news}
          onVerMas={() => router.push('/(tabs)/news' as any)}
        />
        <TipCard
          tip='Destina el 20% de tus ingresos al ahorro. Crea un fondo de emergencia de 3-6 meses de gastos para mayor seguridad financiera.'
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 32, gap: 20 },
  balanceContainer: {
    backgroundColor: Colors.greenPrimary,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  topSection: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    padding: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
    marginLeft: 6,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  col: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  colLabel: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.7)',
  },
  colAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    alignItems: 'flex-start',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
});
