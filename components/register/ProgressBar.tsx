import { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Animated } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { APP_THEME } from "@/constants/themes";
 
type Props = {
  step: number;
};
 
export default function ProgressBar({ step }: Props) {
  const progress = useRef(new Animated.Value(step)).current;
  const stepScale = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);
 
  const primary = APP_THEME.button.primary.background;
  const mutedForeground = APP_THEME.text.secondary;
  const border = APP_THEME.input.border;
  const textPrimary = APP_THEME.text.primary;
 
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.setValue(step);
      return;
    }
    Animated.timing(progress, {
      toValue: step,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [step]);
 
  useEffect(() => {
    stepScale.setValue(0.9);
    Animated.spring(stepScale, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [step]);
 
  const progressWidth = progress.interpolate({
    inputRange: [1, 2, 3],
    outputRange: ["5%", "50%", "100%"],
  });
 
  return (
    <View style={styles.progressBar}>
      <View style={styles.stepsContainer}>
        {/* Paso 1 */}
        <Animated.View
          style={[
            styles.progressStep,
            {
              borderColor: step >= 1 ? primary : mutedForeground,
              backgroundColor: step > 1 ? primary : "transparent",
              transform: [{ scale: step === 1 ? stepScale : 1 }],
            },
          ]}
        >
          {step > 1 ? (
            <Ionicons name="checkmark" size={32} color={textPrimary} />
          ) : (
            <Feather name="user" size={24} color={primary} />
          )}
        </Animated.View>
 
        {/* Paso 2 */}
        <Animated.View
          style={[
            styles.progressStep,
            {
              borderColor: step >= 2 ? primary : mutedForeground,
              backgroundColor: step > 2 ? primary : "transparent",
              transform: [{ scale: step === 2 ? stepScale : 1 }],
            },
          ]}
        >
          {step > 2 ? (
            <Ionicons name="checkmark" size={32} color={textPrimary} />
          ) : (
            <Feather
              name="dollar-sign"
              size={24}
              color={step >= 2 ? primary : mutedForeground}
            />
          )}
        </Animated.View>
 
        {/* Paso 3 */}
        <Animated.View
          style={[
            styles.progressStep,
            {
              borderColor: step >= 3 ? primary : mutedForeground,
              transform: [{ scale: step === 3 ? stepScale : 1 }],
            },
          ]}
        >
          <Ionicons
            name="newspaper-outline"
            size={24}
            color={step >= 3 ? primary : mutedForeground}
          />
        </Animated.View>
      </View>
 
      {/* Barra de progreso */}
      <View style={[styles.progressTrack, { backgroundColor: border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: primary, width: progressWidth },
          ]}
        />
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    gap: 8,
    alignItems: "center",
  },
  stepsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  progressTrack: {
    height: 6,
    width: "90%",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});