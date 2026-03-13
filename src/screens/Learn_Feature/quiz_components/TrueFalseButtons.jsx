import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { useAppTheme } from "../../../context/ThemeContext";

export default function TrueFalseButtons({ value, onSelect }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const selectedTrue = value === true;
  const selectedFalse = value === false;

  return (
    <View style={styles.tfWrap}>
      <TouchableOpacity
        style={[styles.tfChoice, selectedTrue && styles.tfChoiceTrueSelected]}
        onPress={() => onSelect(true)}
        activeOpacity={0.85}
      >
        <View style={[styles.choiceDot, selectedTrue && styles.choiceDotTrueSelected]} />
        <Text style={[styles.choiceText, selectedTrue && styles.choiceTextSelected]}>True</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tfChoice, selectedFalse && styles.tfChoiceFalseSelected]}
        onPress={() => onSelect(false)}
        activeOpacity={0.85}
      >
        <View style={[styles.choiceDot, selectedFalse && styles.choiceDotFalseSelected]} />
        <Text style={[styles.choiceText, selectedFalse && styles.choiceTextSelected]}>False</Text>
      </TouchableOpacity>
    </View>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
  tfWrap: {
    backgroundColor: palette.backgroundAlt,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 14,
    padding: scale(6),
    flexDirection: "row",
    gap: scale(6),
  },
  tfChoice: {
    flex: 1,
    minHeight: verticalScale(44),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    backgroundColor: palette.input,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
  },
  tfChoiceTrueSelected: {
    backgroundColor: "#14532d",
    borderColor: "#22c55e",
  },
  tfChoiceFalseSelected: {
    backgroundColor: "#7f1d1d",
    borderColor: "#f87171",
  },
  choiceDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: 999,
    backgroundColor: "#64748b",
  },
  choiceDotTrueSelected: {
    backgroundColor: "#4ade80",
  },
  choiceDotFalseSelected: {
    backgroundColor: "#fca5a5",
  },
  choiceText: {
    color: palette.textSecondary,
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  choiceTextSelected: {
    color: palette.textPrimary,
  },
  });
}
