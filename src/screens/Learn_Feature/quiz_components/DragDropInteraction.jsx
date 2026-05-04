import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "../../../styles/responsive";
import { useAppTheme } from "../../../context/ThemeContext";
import {
  formatDragDropAnswerPairs,
  getDragDropOptionBank,
  getDragDropSlots,
  isDragDropAnswerComplete,
} from "./dragDropUtils";

const DRAG_ACTIVATION_DISTANCE = 1;
const DROP_HIT_SLOP = scale(18);

export default function DragDropInteraction({ question, value, onChange, onDragStateChange }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const slots = useMemo(() => getDragDropSlots(question), [question]);
  const rightOptions = useMemo(() => getDragDropOptionBank(question), [question]);
  const selected = value && typeof value === "object" ? value : {};
  const answerPairs = useMemo(() => formatDragDropAnswerPairs(question, selected), [question, selected]);
  const completedCount = useMemo(
    () => answerPairs.filter((pair) => pair.isFilled).length,
    [answerPairs]
  );
  const allFilled = useMemo(
    () => isDragDropAnswerComplete(question, selected),
    [question, selected]
  );
  const selectedRef = useRef(selected);
  const panMapRef = useRef({});
  const slotRefs = useRef({});
  const slotBoundsRef = useRef({});
  const activeDragRef = useRef("");
  const hoverTargetRef = useRef("");

  const [draggingOption, setDraggingOption] = useState("");

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    return () => {
      if (typeof onDragStateChange === "function") {
        onDragStateChange(false);
      }
    };
  }, [onDragStateChange]);

  const getPan = useCallback((option) => {
    if (!panMapRef.current[option]) {
      panMapRef.current[option] = new Animated.ValueXY({ x: 0, y: 0 });
    }
    return panMapRef.current[option];
  }, []);

  const measureSlot = useCallback((slotKey) => {
    const ref = slotRefs.current[slotKey];
    if (!ref || typeof ref.measureInWindow !== "function") return;

    ref.measureInWindow((x, y, width, height) => {
      slotBoundsRef.current[slotKey] = { x, y, width, height };
    });
  }, []);

  const measureAllSlots = useCallback(() => {
    slots.forEach((slot) => {
      measureSlot(slot.slotKey);
    });
  }, [measureSlot, slots]);

  const findDropTarget = useCallback((pageX, pageY) => {
    for (const [slotKey, bounds] of Object.entries(slotBoundsRef.current)) {
      if (
        pageX >= bounds.x - DROP_HIT_SLOP &&
        pageX <= bounds.x + bounds.width + DROP_HIT_SLOP &&
        pageY >= bounds.y - DROP_HIT_SLOP &&
        pageY <= bounds.y + bounds.height + DROP_HIT_SLOP
      ) {
        return slotKey;
      }
    }
    return "";
  }, []);

  const setSlotStyle = useCallback(
    (slotKey, isHover) => {
      const ref = slotRefs.current[slotKey];
      if (!ref || typeof ref.setNativeProps !== "function") return;

      const isFilled = Boolean(selectedRef.current[slotKey]);
      ref.setNativeProps({
        style: [styles.dropZone, isFilled && styles.dropZoneFilled, isHover && styles.dropZoneHover],
      });
    },
    []
  );

  const clearHoverTarget = useCallback(() => {
    if (!hoverTargetRef.current) return;
    setSlotStyle(hoverTargetRef.current, false);
    hoverTargetRef.current = "";
  }, [setSlotStyle]);

  const updateHoverTarget = useCallback(
    (nextTarget) => {
      if (nextTarget === hoverTargetRef.current) return;

      if (hoverTargetRef.current) {
        setSlotStyle(hoverTargetRef.current, false);
      }

      hoverTargetRef.current = nextTarget;
      if (nextTarget) {
        setSlotStyle(nextTarget, true);
      }
    },
    [setSlotStyle]
  );

  const assignOption = useCallback(
    (option, slotKey) => {
      const current = selectedRef.current;
      const next = { ...current };

      Object.keys(next).forEach((existingSlotKey) => {
        if (next[existingSlotKey] === option) {
          delete next[existingSlotKey];
        }
      });

      next[slotKey] = option;
      onChange(next);
    },
    [onChange]
  );

  const clearSlot = useCallback(
    (slotKey) => {
      if (!selected[slotKey]) return;
      const next = { ...selected };
      delete next[slotKey];
      onChange(next);
    },
    [onChange, selected]
  );

  const resetDragState = useCallback(
    (option) => {
      const pan = getPan(option);
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        bounciness: 6,
        speed: 22,
      }).start();

      clearHoverTarget();
      activeDragRef.current = "";
      setDraggingOption("");
      if (typeof onDragStateChange === "function") {
        onDragStateChange(false);
      }
    },
    [clearHoverTarget, getPan, onDragStateChange]
  );

  if (slots.length === 0) {
    return <Text style={styles.helperText}>No drag-drop pairs available.</Text>;
  }

  return (
    <View style={styles.dragWrap}>
      {typeof question?.dragDrop?.prompt === "string" ? (
        <Text style={styles.helperText}>{question.dragDrop.prompt}</Text>
      ) : null}
      <View style={styles.dropZoneWrap}>
        {answerPairs.map(({ slotKey, leftLabel, value: matchedValue }, pairIndex) => {

          return (
            <View
              key={`target-${slotKey}-${pairIndex}`}
              ref={(node) => {
                if (node) slotRefs.current[slotKey] = node;
              }}
              onLayout={() => measureSlot(slotKey)}
              style={[
                styles.dropZone,
                matchedValue && styles.dropZoneFilled,
              ]}
            >
              <View style={styles.dropZoneHeader}>
                <Text style={styles.dropZoneLabel}>{leftLabel}</Text>
              </View>
              <View style={styles.dropZoneAnswerRow}>
                <Text style={[styles.dropZoneAnswer, !matchedValue && styles.dropZoneAnswerPlaceholder]}>
                  {matchedValue || "Drop the matching definition here"}
                </Text>
                {matchedValue ? (
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={() => clearSlot(slotKey)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.optionBank}>
        <Text style={styles.optionBankTitle}>Option bank</Text>
        <View style={styles.optionChipWrap}>
          {rightOptions.map((option) => {
            const pan = getPan(option);
            const isDragging = draggingOption === option;
            const isOtherDragging = draggingOption && draggingOption !== option;

            const panResponder = PanResponder.create({
              onStartShouldSetPanResponder: () => {
                return !activeDragRef.current || activeDragRef.current === option;
              },
              onStartShouldSetPanResponderCapture: () => {
                return !activeDragRef.current || activeDragRef.current === option;
              },
              onMoveShouldSetPanResponder: (_, gestureState) => {
                if (activeDragRef.current && activeDragRef.current !== option) return false;
                return (
                  Math.abs(gestureState.dx) > DRAG_ACTIVATION_DISTANCE ||
                  Math.abs(gestureState.dy) > DRAG_ACTIVATION_DISTANCE
                );
              },
              onMoveShouldSetPanResponderCapture: (_, gestureState) => {
                if (activeDragRef.current && activeDragRef.current !== option) return false;
                return (
                  Math.abs(gestureState.dx) > DRAG_ACTIVATION_DISTANCE ||
                  Math.abs(gestureState.dy) > DRAG_ACTIVATION_DISTANCE
                );
              },
              onPanResponderGrant: () => {
                activeDragRef.current = option;
                pan.stopAnimation();
                pan.setValue({ x: 0, y: 0 });
                measureAllSlots();
                clearHoverTarget();
                setDraggingOption(option);
                if (typeof onDragStateChange === "function") {
                  onDragStateChange(true);
                }
              },
              onPanResponderMove: (_, gestureState) => {
                pan.setValue({ x: gestureState.dx, y: gestureState.dy });
                const target = findDropTarget(gestureState.moveX, gestureState.moveY);
                updateHoverTarget(target);
              },
              onPanResponderRelease: (_, gestureState) => {
                const target = findDropTarget(gestureState.moveX, gestureState.moveY);
                if (target) {
                  assignOption(option, target);
                }
                resetDragState(option);
              },
              onPanResponderTerminate: () => {
                resetDragState(option);
              },
              onPanResponderTerminationRequest: () => false,
              onShouldBlockNativeResponder: () => true,
            });

            return (
              <Animated.View
                key={`option-${option}`}
                pointerEvents={isOtherDragging ? "none" : "auto"}
                {...panResponder.panHandlers}
                style={[
                  styles.optionChip,
                  Object.values(selected).includes(option) && styles.optionChipAssigned,
                  isDragging && styles.optionChipDragging,
                  { transform: pan.getTranslateTransform() },
                ]}
              >
                <Text style={styles.optionChipText}>{option}</Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
  helperText: {
    color: palette.textMuted,
    fontSize: moderateScale(12),
    marginBottom: verticalScale(6),
  },
  dragWrap: {
    gap: verticalScale(10),
  },
  summaryCard: {
    backgroundColor: palette.backgroundAlt,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 14,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: scale(10),
  },
  summaryTitle: {
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "800",
  },
  summaryText: {
    color: palette.textMuted,
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    marginTop: verticalScale(3),
    maxWidth: scale(180),
  },
  summaryBadge: {
    borderRadius: 999,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    backgroundColor: palette.input,
    borderWidth: 1,
    borderColor: palette.inputBorder,
  },
  summaryBadgeComplete: {
    backgroundColor: "#14532d",
    borderColor: "#22c55e",
  },
  summaryBadgeText: {
    color: palette.textPrimary,
    fontSize: moderateScale(11),
    fontWeight: "800",
  },
  dropZoneWrap: {
    gap: verticalScale(8),
  },
  dropZone: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 12,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    gap: verticalScale(6),
  },
  dropZoneHeader: {
    gap: verticalScale(2),
  },
  dropZoneHover: {
    borderColor: "#38bdf8",
    backgroundColor: "#082f49",
  },
  dropZoneFilled: {
    borderColor: "#22c55e",
    backgroundColor: "#052e16",
  },
  dropZoneLabel: {
    color: "#fde68a",
    fontSize: moderateScale(11),
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dropZoneTerm: {
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  dropZoneAnswerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: scale(8),
  },
  dropZoneAnswer: {
    color: palette.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: "700",
    flex: 1,
    lineHeight: moderateScale(18),
  },
  dropZoneAnswerPlaceholder: {
    color: palette.textMuted,
    fontWeight: "600",
  },
  clearBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    backgroundColor: palette.input,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
  },
  clearBtnText: {
    color: "#93c5fd",
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  optionBank: {
    marginTop: verticalScale(2),
    backgroundColor: palette.backgroundAlt,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 12,
    padding: scale(10),
    gap: verticalScale(8),
  },
  optionBankTitle: {
    color: "#93c5fd",
    fontSize: moderateScale(11),
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  optionChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
  },
  optionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    backgroundColor: palette.input,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  optionChipAssigned: {
    borderColor: "#1d4ed8",
    backgroundColor: "#172554",
  },
  optionChipDragging: {
    borderColor: "#38bdf8",
    backgroundColor: "#0c4a6e",
    zIndex: 20,
    elevation: 6,
  },
  optionChipText: {
    color: palette.textPrimary,
    fontSize: moderateScale(12),
    fontWeight: "700",
    flexShrink: 1,
  },
  optionChipMeta: {
    color: "#93c5fd",
    fontSize: moderateScale(10),
    fontWeight: "700",
    textTransform: "uppercase",
  },
  });
}
