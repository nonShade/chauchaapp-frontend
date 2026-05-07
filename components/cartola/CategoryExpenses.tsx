import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME } from '@/constants/themes';
import { DistributionData } from '@/types/transaction';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width * 0.8;
const SLIDE_GAP = 16;
const SNAP_INTERVAL = SLIDE_WIDTH + SLIDE_GAP;

interface CategoryExpensesProps {
  distribution: DistributionData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CategoryExpenses({ distribution }: CategoryExpensesProps) {
  const expenseColor = APP_THEME.cards.expense.text;
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Ordenar de mayor a menor gasto
  const sortedDistribution = [...distribution].sort((a, b) => b.amount - a.amount);

  const chunks: DistributionData[][] = [];
  for (let i = 0; i < sortedDistribution.length; i += 5) {
    chunks.push(sortedDistribution.slice(i, i + 5));
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index >= 0 && index < chunks.length) {
      setActiveIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * SNAP_INTERVAL, animated: true });
  };

  const maxAmount = sortedDistribution.length > 0 ? sortedDistribution[0].amount : 0;

  const renderItem = (item: DistributionData, index: number) => {
    const relativePercentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;

    return (
      <View key={index} style={styles.item}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Ionicons
              name="pricetag-outline"
              size={18}
              color={APP_THEME.text.secondary}
            />
            <Text style={styles.itemName}>{item.category}</Text>
          </View>
          <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${relativePercentage}%`,
                backgroundColor: expenseColor
              }
            ]}
          />
        </View>
      </View>
    );
  };

  const renderDotIndicator = () => {
    if (chunks.length <= 1) return null;
    return (
      <View style={styles.dotContainer}>
        {chunks.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            activeOpacity={0.7}
            style={styles.dotButton}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: index === activeIndex ? expenseColor : APP_THEME.card.progressBg,
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wallet-outline" size={22} color={expenseColor} />
        <Text style={styles.title}>Gastos personales</Text>
      </View>

      {sortedDistribution.length === 0 ? (
        <Text style={{ color: APP_THEME.text.secondary, paddingVertical: 10 }}>
          No hay datos de gastos.
        </Text>
      ) : chunks.length > 1 ? (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {chunks.map((chunk, chunkIndex) => (
              <View
                key={chunkIndex}
                style={[
                  styles.list,
                  {
                    width: SLIDE_WIDTH,
                    marginRight: chunkIndex === chunks.length - 1 ? 0 : SLIDE_GAP,
                  },
                ]}
              >
                {chunk.map((item, index) => renderItem(item, index))}
              </View>
            ))}
          </ScrollView>
          {renderDotIndicator()}
        </>
      ) : (
        <View style={styles.list}>
          {sortedDistribution.map((item, index) => renderItem(item, index))}
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
    gap: 10,
    marginBottom: 24,
  },
  title: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    gap: 22,
  },
  item: {
    gap: 10,
    paddingRight: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemName: {
    color: APP_THEME.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  itemAmount: {
    color: APP_THEME.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: APP_THEME.card.progressBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotButton: {
    padding: 4,
  },
});