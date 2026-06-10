import { useRef, useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Platform,
} from "react-native";
import { APP_THEME, Typography } from "@/constants/themes";

// ─── Constantes ───────────────────────────────────────────────────────────────

const ITEM_HEIGHT   = 48;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2); // 2 ítems de padding arriba/abajo

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = (SCREEN_WIDTH - 32) / 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ─── Columna individual ───────────────────────────────────────────────────────

interface DrumColumnProps {
  items:         (number | string)[];
  selectedIndex: number;
  onSelect:      (index: number) => void;
  formatItem?:   (item: number | string) => string;
  width:         number;
}

function DrumColumn({ items, selectedIndex, onSelect, formatItem, width }: DrumColumnProps) {
  const scrollRef      = useRef<ScrollView>(null);
  const isMomentum     = useRef(false);
  const lastIndex      = useRef(selectedIndex);

  const primary         = APP_THEME.button.primary.background as string;
  const mutedForeground = APP_THEME.text.secondary            as string;
  const border          = APP_THEME.input.border              as string;

  // ── Scroll inicial ──
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, []);

  // ── Sincronizar cuando el padre cambia el índice (ej. días al cambiar mes) ──
  useEffect(() => {
    if (lastIndex.current !== selectedIndex) {
      lastIndex.current = selectedIndex;
      // Pequeño delay para no chocar con gestos en curso
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: true });
      }, 50);
    }
  }, [selectedIndex]);

  // ── Snap y notificación al padre ──
  const snapToIndex = useCallback((y: number) => {
    const index   = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    if (clamped !== lastIndex.current) {
      lastIndex.current = clamped;
      onSelect(clamped);
    }
    // Siempre forzar la posición correcta, incluso si el índice no cambió
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    }, 10);
  }, [items.length, onSelect]);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isMomentum.current = false;
      snapToIndex(e.nativeEvent.contentOffset.y);
    },
    [snapToIndex]
  );

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Solo snapear aquí si no hay momentum pendiente (ruedita del mouse / drag corto)
      if (!isMomentum.current) {
        snapToIndex(e.nativeEvent.contentOffset.y);
      }
    },
    [snapToIndex]
  );

  // ── Drag con mouse en web ──
  const webDragRef        = useRef({ active: false, startY: 0, startScroll: 0 });
  const webScrollTopRef   = useRef(0);

  const webHandlers = Platform.OS === "web" ? {
    onMouseDown: (e: any) => {
      webDragRef.current = {
        active:      true,
        startY:      e.clientY,
        startScroll: webScrollTopRef.current,
      };
      e.preventDefault();
    },
    onMouseMove: (e: any) => {
      if (!webDragRef.current.active) return;
      const delta     = webDragRef.current.startY - e.clientY;
      const newScroll = webDragRef.current.startScroll + delta;
      // Accedemos al scrollview interno via ref
      const node = (scrollRef.current as any)?._nativeTag
        ?? (scrollRef.current as any)?.getScrollableNode?.();
      if (node && typeof node.scrollTop !== "undefined") {
        node.scrollTop = newScroll;
        webScrollTopRef.current = newScroll;
      }
    },
    onMouseUp: (e: any) => {
      if (!webDragRef.current.active) return;
      webDragRef.current.active = false;
      snapToIndex(webScrollTopRef.current);
    },
    onMouseLeave: (e: any) => {
      if (!webDragRef.current.active) return;
      webDragRef.current.active = false;
      snapToIndex(webScrollTopRef.current);
    },
  } : {};

  return (
    <View
      style={[styles.columnWrapper, { width }]}
        {...webHandlers}
    >
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate={Platform.OS === "android" ? 0.85 : "fast"}
        disableIntervalMomentum={true} 
        onMomentumScrollBegin={() => { isMomentum.current = true; }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleScrollEndDrag}
        onScroll={(e) => {
          webScrollTopRef.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: PADDING_ITEMS * ITEM_HEIGHT }}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          const distance   = Math.abs(index - selectedIndex);
          const opacity    = distance === 0 ? 1 : distance === 1 ? 0.45 : 0.15;
          const fontSize   = isSelected ? 20 : 16;

          return (
            <View key={index} style={styles.drumItem}>
              <Text
                style={{
                  color:      isSelected ? primary : mutedForeground,
                  fontWeight: isSelected ? "700" : "400",
                  fontSize,
                  opacity,
                  textAlign:  "center",
                }}
              >
                {formatItem ? formatItem(item as number) : String(item)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Líneas de selección — encima del scroll, sin bloquear eventos */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1 }} />
        <View style={[styles.selectionHighlight, { borderColor: border }]} />
        <View style={{ flex: 1 }} />
      </View>
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Props = {
  value:    Date;
  minDate:  Date;
  maxDate:  Date;
  onChange: (date: Date) => void;
};

export default function DateDrumPicker({ value, minDate, maxDate, onChange }: Props) {
  const background = APP_THEME.background.primary as string;

  const currentDay   = value.getDate();
  const currentMonth = value.getMonth() + 1;
  const currentYear  = value.getFullYear();

  const minYear = maxDate.getFullYear();
  const maxYear = minDate.getFullYear();

  const years  = range(minYear, maxYear).reverse();
  const months = range(1, 12);
  const days   = range(1, getDaysInMonth(currentMonth, currentYear));

  const dayIndex   = Math.max(0, days.indexOf(currentDay));
  const monthIndex = Math.max(0, months.indexOf(currentMonth));
  const yearIndex  = Math.max(0, years.indexOf(currentYear));

  const clampDay = (day: number, month: number, year: number) =>
    Math.min(day, getDaysInMonth(month, year));

  const handleDayChange = (index: number) => {
    const newDay = days[index];
    onChange(new Date(currentYear, currentMonth - 1, clampDay(newDay, currentMonth, currentYear)));
  };

  const handleMonthChange = (index: number) => {
    const newMonth = months[index];
    onChange(new Date(currentYear, newMonth - 1, clampDay(currentDay, newMonth, currentYear)));
  };

  const handleYearChange = (index: number) => {
    const newYear = years[index];
    onChange(new Date(newYear, currentMonth - 1, clampDay(currentDay, currentMonth, newYear)));
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <DrumColumn
        items={days}
        selectedIndex={dayIndex}
        onSelect={handleDayChange}
        formatItem={(d) => String(d).padStart(2, "0")}
        width={COLUMN_WIDTH}
      />
      <DrumColumn
        items={months}
        selectedIndex={monthIndex}
        onSelect={handleMonthChange}
        formatItem={(m) => MONTHS[(m as number) - 1]}
        width={COLUMN_WIDTH}
      />
      <DrumColumn
        items={years}
        selectedIndex={yearIndex}
        onSelect={handleYearChange}
        formatItem={(y) => String(y)}
        width={COLUMN_WIDTH}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection:  "row",
    height:         PICKER_HEIGHT,
    borderRadius:   12,
    overflow:       "hidden",   // ← corta las opciones que salen del área
  },
  columnWrapper: {
    height:   PICKER_HEIGHT,
    overflow: "hidden",         // ← corta por columna también
  },
  drumItem: {
    height:         ITEM_HEIGHT,
    alignItems:     "center",
    justifyContent: "center",
  },
  selectionHighlight: {
    height:          ITEM_HEIGHT,
    borderTopWidth:  1,
    borderBottomWidth: 1,
    marginHorizontal: 4,
  },
});