import React, { useMemo } from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import { useAppTheme } from "../context/ThemeContext";

export default function AiInsights() {
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette, isLight), [palette, isLight]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.shell}>
        <LinearGradient colors={[palette.heroStart, palette.heroEnd]} style={styles.hero}>
          <Text style={[styles.heroTitle, isLight && styles.heroTitleLight]}>AI Insights</Text>
          <Text style={[styles.heroSubtitle, isLight && styles.heroSubtitleLight]}>
            This page is intentionally empty for now while the insights feature is being rebuilt.
          </Text>
        </LinearGradient>

        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Coming soon</Text>
          <Text style={styles.placeholderBody}>
            Model signals, summaries, and other insight modules will be added back here later.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function buildStyles(palette, isLight) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: palette.background,
    },
    shell: {
      flex: 1,
      padding: scale(18),
    },
    hero: {
      borderRadius: scale(24),
      paddingHorizontal: scale(18),
      paddingTop: verticalScale(20),
      paddingBottom: verticalScale(24),
    },
    heroTitle: {
      color: palette.white,
      fontSize: moderateScale(26),
      fontWeight: "900",
      lineHeight: moderateScale(31),
    },
    heroTitleLight: {
      color: palette.textPrimary,
    },
    heroSubtitle: {
      marginTop: verticalScale(8),
      color: palette.textSecondary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },
    heroSubtitleLight: {
      color: palette.textSecondary,
    },
    placeholderCard: {
      marginTop: verticalScale(18),
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(20),
      padding: scale(18),
    },
    placeholderTitle: {
      color: palette.textPrimary,
      fontSize: moderateScale(18),
      fontWeight: "800",
    },
    placeholderBody: {
      marginTop: verticalScale(8),
      color: palette.textSecondary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(20),
    },
  });
}
