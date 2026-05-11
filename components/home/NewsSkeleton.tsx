import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { APP_THEME } from '@/constants/themes';

export function NewsSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.header} />
      <View style={styles.body}>
        <View style={styles.title} />
        <View style={styles.text1} />
        <View style={styles.text2} />
        <View style={styles.footer} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    overflow: 'hidden',
    backgroundColor: APP_THEME.card.background,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  header: {
    height: 44,
    backgroundColor: APP_THEME.background.primary,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  title: {
    height: 20,
    backgroundColor: APP_THEME.background.primary,
    borderRadius: 4,
  },
  text1: {
    height: 16,
    backgroundColor: APP_THEME.background.primary,
    borderRadius: 4,
    width: '90%',
  },
  text2: {
    height: 16,
    backgroundColor: APP_THEME.background.primary,
    borderRadius: 4,
    width: '85%',
  },
  footer: {
    height: 40,
    backgroundColor: APP_THEME.background.primary,
    borderRadius: 4,
    marginTop: 8,
  },
});
