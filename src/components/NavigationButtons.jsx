import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BookOpen, MessageCircle, Sparkles, Eye } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";

const buttons = [
  { icon: BookOpen, label: "Learn", colors: ["#3b82f6", "#1d4ed8"] },
  { icon: MessageCircle, label: "Consult", colors: ["#a855f7", "#6b21a8"] },
  { icon: Sparkles, label: "AI Insights", colors: ["#f59e0b", "#b45309"] },
  { icon: Eye, label: "Watchlist", colors: ["#22c55e", "#15803d"] },
];

export default function NavigationButtons() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  return (
    <View style={styles.container}>
      {buttons.map((b) => (
        <TouchableOpacity key={b.label} style={styles.button} activeOpacity={0.8}>
          <LinearGradient colors={b.colors} style={styles.iconCircle}>
            <b.icon size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.label}>{b.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    width: "48%",
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: "600", color: palette.textPrimary },
  });
}
