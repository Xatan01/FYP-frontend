import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";

export default function ChoiceButtons({ options, value, onSelect }) {
  if (!Array.isArray(options) || options.length === 0) {
    return <Text style={styles.helperText}>No options available.</Text>;
  }

  return (
    <View style={styles.optionsColumn}>
      {options.map((option) => {
        const selected = value === option.key;
        return (
          <TouchableOpacity
            key={`opt-${option.key}-${option.text}`}
            style={[styles.choiceBtn, selected && styles.choiceBtnSelected]}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.85}
          >
            <View style={[styles.choiceKeyBadge, selected && styles.choiceKeyBadgeSelected]}>
              <Text style={[styles.choiceKey, selected && styles.choiceTextSelected]}>
                {option.key}
              </Text>
            </View>
            <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
              {option.text}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  helperText: {
    color: "#94a3b8",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(6),
  },
  optionsColumn: {
    gap: verticalScale(8),
  },
  choiceBtn: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 12,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(10),
  },
  choiceBtnSelected: {
    backgroundColor: "#1e3a8a",
    borderColor: "#3b82f6",
  },
  choiceKeyBadge: {
    minWidth: scale(28),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 999,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceKeyBadgeSelected: {
    backgroundColor: "#1d4ed8",
    borderColor: "#60a5fa",
  },
  choiceKey: {
    color: "#93c5fd",
    fontSize: moderateScale(12),
    fontWeight: "800",
  },
  choiceText: {
    color: "#d1d5db",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontWeight: "600",
    flex: 1,
    paddingTop: verticalScale(2),
  },
  choiceTextSelected: {
    color: "#dbeafe",
  },
});
