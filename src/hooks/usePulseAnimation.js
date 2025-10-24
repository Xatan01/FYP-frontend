import { useRef } from "react";
import { Animated } from "react-native";

// This hook provides a looping pulse animation style
export default function usePulseAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  Animated.loop(
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ])
  ).start();

  return { transform: [{ scale: scaleAnim }] };
}