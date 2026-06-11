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
  const [activeTab, setActiveTab] = useState<'income' | 'both' | 'expense'>('both');

  const rawLabels = data?.labels ?? [];
  const incomes = data?.income ?? [];
  const expenses = data?.expense ?? [];

  const isIncome = activeTab === 'income';
  const isExpense = activeTab === 'expense';
  const isBoth = activeTab === 'both';

  const labels = rawLabels;

  const maxIncome = incomes.length > 0 ? Math.max(...incomes) : 0;
  const maxExpense = expenses.length > 0 ? Math.max(...expenses) : 0;

  let maxValue = 1;
  if (isIncome) maxValue = Math.max(maxIncome, 1);
  else if (isExpense) maxValue = Math.max(maxExpense, 1);
  else maxValue = Math.max(maxIncome, maxExpense, 1);

  const niceMax = Math.ceil(maxValue / 250_000) * 250_000 || 1_000_000;
  const yTicks = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];

  const n = labels.length;
  const drawWidth = CHART_WIDTH - X_PAD * 2;
  const xStep = n > 1 ? drawWidth / (n - 1) : drawWidth;

  const getY = (value: number): number => {
    const ratio = Math.min(value / niceMax, 1);
    return CHART_HEIGHT - ratio * CHART_HEIGHT;
  };

  const incomePoints = incomes.map((val, idx) => ({
    x: X_PAD + idx * xStep,
    y: getY(val),
  }));

  const expensePoints = expenses.map((val, idx) => ({
    x: X_PAD + idx * xStep,
    y: getY(val),
  }));

  const incomeLinePath = incomePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const expenseLinePath = expensePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

  const hasData = n > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bar-chart-outline" size={18} color={isGroup ? APP_THEME.group.primary : APP_THEME.cards.balance.tagText} />
        <Text style={styles.title}>{isGroup ? 'Resumen Grupal' : 'Resumen Personal'}</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tab, 
            isBoth && {
              backgroundColor: isGroup ? APP_THEME.group.modeTagBg : APP_THEME.cards.balance.tagBg,
              borderWidth: 1,
              borderColor: isGroup ? APP_THEME.group.primary : APP_THEME.cards.balance.border,
              margin: 3,
              borderRadius: 9,
            }
          ]}
          onPress={() => setActiveTab('both')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, isBoth && { color: isGroup ? APP_THEME.group.primary : APP_THEME.cards.balance.tagText, fontWeight: '700' }]}>
            I vs G
          </Text>
        </TouchableOpacity>

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
          style={[styles.tab, isExpense && styles.tabActiveExpense]}
          onPress={() => setActiveTab('expense')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="trending-down-outline"
            size={14}
            color={isExpense ? APP_THEME.cards.expense.text : APP_THEME.text.secondary}
          />
          <Text style={[styles.tabText, isExpense && { color: APP_THEME.cards.expense.text, fontWeight: '700' }]}>
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

              {(isIncome || isBoth) && n > 1 && (
                <Path d={incomeLinePath} fill="none" stroke={APP_THEME.cards.income.text} strokeWidth={2.5} />
              )}
              {(isIncome || isBoth) && incomePoints.map((p, idx) => (
                <Circle
                  key={`inc-pt-${idx}`}
                  cx={p.x} cy={p.y}
                  r={4}
                  fill={APP_THEME.cards.income.text}
                />
              ))}

              {(isExpense || isBoth) && n > 1 && (
                <Path d={expenseLinePath} fill="none" stroke={APP_THEME.cards.expense.text} strokeWidth={2.5} />
              )}
              {(isExpense || isBoth) && expensePoints.map((p, idx) => (
                <Circle
                  key={`exp-pt-${idx}`}
                  cx={p.x} cy={p.y}
                  r={4}
                  fill={APP_THEME.cards.expense.text}
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
          {(isIncome || isBoth) && (
            <>
              <View style={[styles.legendDot, { backgroundColor: APP_THEME.cards.income.text }]} />
              <Text style={styles.legendText}>Ingresos</Text>
            </>
          )}
          {isBoth && <View style={{ width: 16 }} />}
          {(isExpense || isBoth) && (
            <>
              <View style={[styles.legendDot, { backgroundColor: APP_THEME.cards.expense.text }]} />
              <Text style={styles.legendText}>Gastos</Text>
            </>
          )}
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