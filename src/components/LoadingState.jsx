import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../styles/responsive";
import { useAppTheme } from "../context/ThemeContext";

const INPUT_RANGE = Array.from({ length: 12 }, (_, index) => index / 11);

const BOX_MOTION = [
  {
    start: [1, 0],
    x: [0, -1, 0, 0, 1, 1, 1, 1, 1, 0, -1, 0],
    y: [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
  },
  {
    start: [1, 0],
    x: [0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    y: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  },
  {
    start: [2, 2],
    x: [0, -1, -1, 0, -1, -1, -1, -1, -1, -1, 0, 0],
    y: [0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0],
  },
  {
    start: [1, 1],
    x: [0, -1, -1, -1, 0, 0, 0, 0, 0, -1, -1, 0],
    y: [0, 0, 0, -1, -1, 0, -1, -1, -1, -1, 0, 0],
  },
  {
    start: [1, 1],
    x: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    y: [0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0],
  },
  {
    start: [2, 1],
    x: [0, 0, -1, -1, 0, 0, 0, 0, 0, -1, -1, 0],
    y: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  },
  {
    start: [0, 2],
    x: [0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    y: [0, 0, 0, 0, 0, -1, -1, -1, -1, 0, 0, 0],
  },
  {
    start: [1, 2],
    x: [0, 0, -1, -1, 0, 0, 0, 0, 0, 1, 1, 0],
    y: [0, 0, 0, -1, -1, -1, -1, -1, -1, -1, 0, 0],
  },
  {
    start: [2, 2],
    x: [0, -1, -1, 0, -1, 0, 0, -1, -1, -2, -1, 0],
    y: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

function getLoaderMetrics(variant) {
  if (variant === "inline") {
    const box = scale(10);
    const gap = scale(3);
    return {
      box,
      gap,
      step: box + gap,
      size: box * 3 + gap * 2,
      showLabel: false,
    };
  }

  const box = scale(14);
  const gap = scale(4);
  return {
    box,
    gap,
    step: box + gap,
    size: box * 3 + gap * 2,
    showLabel: true,
  };
}

export default function LoadingState({ variant = "card", style }) {
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette, isLight), [palette, isLight]);
  const progress = useRef(new Animated.Value(0)).current;
  const metrics = useMemo(() => getLoaderMetrics(variant), [variant]);
  const boxColors = useMemo(
    () => [palette.accent, palette.tabActive, palette.accentSoftText],
    [palette]
  );
  const isScreen = variant === "screen";
  const isInline = variant === "inline";

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => {
      animation.stop();
      progress.setValue(0);
    };
  }, [progress]);

  return (
    <View
      style={[
        styles.base,
        isScreen ? styles.screen : styles.card,
        isInline ? styles.inline : null,
        style,
      ]}
    >
      <View
        style={[
          styles.loader,
          {
            width: metrics.size,
            height: metrics.size,
          },
        ]}
      >
        {BOX_MOTION.map((box, index) => {
          const translateX = progress.interpolate({
            inputRange: INPUT_RANGE,
            outputRange: box.x.map((value) => value * metrics.step),
          });
          const translateY = progress.interpolate({
            inputRange: INPUT_RANGE,
            outputRange: box.y.map((value) => value * metrics.step),
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.box,
                {
                  width: metrics.box,
                  height: metrics.box,
                  left: box.start[0] * metrics.step,
                  top: box.start[1] * metrics.step,
                  backgroundColor: boxColors[index % boxColors.length],
                  transform: [{ translateX }, { translateY }],
                },
              ]}
            />
          );
        })}
      </View>

      {metrics.showLabel ? <Text style={styles.label}>Loading</Text> : null}
    </View>
  );
}

function buildStyles(palette, isLight) {
  return StyleSheet.create({
    base: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    screen: {
      flex: 1,
      minHeight: verticalScale(220),
      paddingVertical: verticalScale(24),
    },
    card: {
      width: "100%",
      paddingVertical: verticalScale(18),
    },
    inline: {
      paddingVertical: verticalScale(4),
    },
    loader: {
      position: "relative",
    },
    box: {
      position: "absolute",
      borderRadius: scale(3),
      shadowColor: palette.shadow,
      shadowOpacity: isLight ? 0.08 : 0.18,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    label: {
      marginTop: verticalScale(14),
      color: palette.textMuted,
      fontSize: moderateScale(11),
      fontWeight: "600",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
  });
}
