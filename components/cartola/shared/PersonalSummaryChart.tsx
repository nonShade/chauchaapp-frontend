import { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, Path } from 'react-native-svg';
import { Text as SvgText } from 'react-native-svg';
import { APP_THEME } from '@/constants/themes';
import { IncomeExpenseData } from '@/types/transaction';

interface PersonalSummaryChartProps {
  data: IncomeExpenseData | null;
  isGroup?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 30 - 50 - 40;
const X_PAD = 18;
const CHART_HEIGHT = 180;

const formatYAxis = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}k`;
  return val.toString();
};

export default function PersonalSummaryChart({ data, isGroup }: PersonalSummaryChartProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');

  const rawLabels = data?.labels ?? [];
  const incomes = data?.income ?? [];
  const expenses = data?.expense ?? [];

  const isIncome = activeTab === 'income';
  const activeData = isIncome ? incomes : expenses;
  const labels = rawLabels;

  const activeColor = isIncome ? APP_THEME.cards.income.text : APP_THEME.cards.expense.text;
  const legendLabel = isIncome ? 'Ingresos mensuales' : 'Gastos mensuales';

  const maxValue = activeData.length > 0 ? Math.max(...activeData, 1) : 1;
  const niceMax = Math.ceil(maxValue / 250_000) * 250_000 || 1_000_000;
  const yTicks = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];

  const n = labels.length;
  const drawWidth = CHART_WIDTH - X_PAD * 2;
  const xStep = n > 1 ? drawWidth / (n - 1) : drawWidth;

  const getY = (value: number): number => {
    const ratio = Math.min(value / niceMax, 1);
    return CHART_HEIGHT - ratio * CHART_HEIGHT;
  };

  const points = activeData.map((val, idx) => ({
    x: X_PAD + idx * xStep,
    y: getY(val),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

  const hasData = n > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bar-chart-outline" size={18} color={isGroup ? APP_THEME.group.primary : APP_THEME.cards.balance.tagText} />
        <Text style={styles.title}>{isGroup ? 'Resumen Grupal' : 'Resumen Personal'}</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, isIncome && styles.tabActiveIncome]}
          onPress={() => setActiveTab('income')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="trending-up-outline"
            size={14}
            color={isIncome ? APP_THEME.cards.income.text : APP_THEME.text.secondary}
          />
          <Text style={[styles.tabText, isIncome && { color: APP_THEME.cards.income.text, fontWeight: '700' }]}>
            Ingresos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, !isIncome && styles.tabActiveExpense]}
          onPress={() => setActiveTab('expense')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="trending-down-outline"
            size={14}
            color={!isIncome ? APP_THEME.cards.expense.text : APP_THEME.text.secondary}
          />
          <Text style={[styles.tabText, !isIncome && { color: APP_THEME.cards.expense.text, fontWeight: '700' }]}>
            Gastos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gráfico */}
      {!hasData ? (
        <Text style={styles.noDataText}>No hay datos disponibles</Text>
      ) : (
        <View style={styles.chartContainer}>
          <View style={styles.yAxisColumn}>
            {yTicks.map((tick, i) => (
              <Text key={i} style={styles.yTick}>{formatYAxis(tick)}</Text>
            ))}
          </View>

          <View style={{ flex: 1 }}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 24}>
              {yTicks.map((tick, i) => {
                const y = getY(tick);
                return (
                  <Line
                    key={`grid-${i}`}
                    x1={0} y1={y}
                    x2={CHART_WIDTH} y2={y}
                    stroke={APP_THEME.card.border}
                    strokeWidth={0.5}
                    strokeDasharray="4"
                  />
                );
              })}

              {n > 1 && (
                <Path d={linePath} fill="none" stroke={activeColor} strokeWidth={2.5} />
              )}

              {points.map((p, idx) => (
                <Circle
                  key={`pt-${idx}`}
                  cx={p.x} cy={p.y}
                  r={4}
                  fill={activeColor}
                />
              ))}

              {labels.map((label, idx) => (
                <SvgText
                  key={`xl-${idx}`}
                  x={X_PAD + idx * xStep}
                  y={CHART_HEIGHT + 20}
                  fontSize={11}
                  fill={APP_THEME.text.secondary}
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              ))}
            </Svg>
          </View>
        </View>
      )}

      {hasData && (
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: activeColor }]} />
          <Text style={styles.legendText}>{legendLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: APP_THEME.card.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabActiveIncome: {
    backgroundColor: '#081B13',
    borderWidth: 1,
    borderColor: APP_THEME.cards.income.border,
    margin: 3,
    borderRadius: 9,
  },
  tabActiveExpense: {
    backgroundColor: '#1F0A0E',
    borderWidth: 1,
    borderColor: APP_THEME.cards.expense.border,
    margin: 3,
    borderRadius: 9,
  },
  tabText: {
    fontSize: 14,
    color: APP_THEME.text.secondary,
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT + 28,
    marginBottom: 8,
  },
  yAxisColumn: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingBottom: 24,
  },
  yTick: {
    color: APP_THEME.text.secondary,
    fontSize: 10,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: APP_THEME.card.border,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: APP_THEME.text.secondary,
    fontSize: 13,
  },
  noDataText: {
    color: APP_THEME.text.secondary,
    textAlign: 'center',
    paddingVertical: 40,
  },
});