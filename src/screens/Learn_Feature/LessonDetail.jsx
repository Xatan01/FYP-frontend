import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { scale, verticalScale, moderateScale } from "../../styles/responsive";

function renderJson(value) {
  if (value == null) return "No lesson content found.";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function toDisplayText(value) {
  if (typeof value === "string") return value.trim();
  return renderJson(value);
}

function formatSubtopicName(name = "") {
  const cleaned = String(name).replace(/_/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function normalizeList(items) {
  if (!Array.isArray(items)) return [];

  const normalized = [];
  items.forEach((item) => {
    if (typeof item === "string") {
      normalized.push({ label: null, text: item.trim() });
      return;
    }

    if (item && typeof item === "object" && !Array.isArray(item)) {
      Object.entries(item).forEach(([label, text]) => {
        normalized.push({ label, text: toDisplayText(text) });
      });
      return;
    }

    normalized.push({ label: null, text: toDisplayText(item) });
  });

  return normalized.filter((entry) => entry.text);
}

function renderListSection(title, items) {
  const rows = normalizeList(items);
  if (rows.length === 0) return null;

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rows.map((row, index) => (
        <View key={`${title}-${index}`} style={styles.listRow}>
          <View style={styles.listIndex}>
            <Text style={styles.listIndexText}>{index + 1}</Text>
          </View>
          <View style={styles.listContent}>
            {row.label ? <Text style={styles.listLabel}>{row.label}</Text> : null}
            <Text style={styles.listText}>{row.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function LessonDetail({ route, navigation }) {
  const {
    topicName,
    subtopicName,
    contentId,
    contentTitle,
    difficulty,
    summary,
    contentJson,
  } = route.params || {};

  let parsedContentJson = null;
  if (contentJson && typeof contentJson === "object") {
    parsedContentJson = contentJson;
  } else if (typeof contentJson === "string") {
    try {
      const maybeJson = JSON.parse(contentJson);
      if (maybeJson && typeof maybeJson === "object") parsedContentJson = maybeJson;
    } catch {
      parsedContentJson = null;
    }
  }

  const displayTitle = contentTitle || parsedContentJson?.title || `Content ${contentId ?? ""}`.trim();
  const displaySummary = summary || parsedContentJson?.summary;
  const subtitle = [topicName, formatSubtopicName(subtopicName)].filter(Boolean).join(" - ");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color="#bfdbfe" />
          <Text style={styles.backBtnText}>Back to learning path</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["#1e293b", "#0f172a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.eyebrow}>{difficulty ? String(difficulty).toUpperCase() : "LESSON"}</Text>
          <Text style={styles.title}>{displayTitle}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {displaySummary ? <Text style={styles.heroSummary}>{displaySummary}</Text> : null}
        </LinearGradient>

        {renderListSection("Examples", parsedContentJson?.examples)}
        {renderListSection("Subtopics", parsedContentJson?.subtopics)}
        {renderListSection("Key Points", parsedContentJson?.key_points)}
        {renderListSection("Common Mistakes", parsedContentJson?.common_mistakes)}
        {renderListSection("Questions to Think About", parsedContentJson?.questions_to_think)}

        {!parsedContentJson ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Raw Content</Text>
            <Text style={styles.code}>{renderJson(contentJson)}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  container: { padding: scale(18), paddingBottom: verticalScale(48) },
  backBtn: {
    marginBottom: verticalScale(12),
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 999,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  backBtnText: { color: "#bfdbfe", fontSize: moderateScale(13), fontWeight: "700" },
  hero: {
    borderRadius: 20,
    padding: scale(18),
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: verticalScale(14),
  },
  eyebrow: {
    color: "#7dd3fc",
    fontSize: moderateScale(11),
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: verticalScale(6),
  },
  title: {
    color: "#e2e8f0",
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginBottom: verticalScale(6),
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: moderateScale(13),
    marginBottom: verticalScale(10),
  },
  heroSummary: {
    color: "#cbd5e1",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(10),
  },
  sectionCard: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    color: "#93c5fd",
    fontSize: moderateScale(14),
    fontWeight: "800",
    marginBottom: verticalScale(10),
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: verticalScale(10),
  },
  listIndex: {
    width: scale(24),
    height: scale(24),
    borderRadius: 999,
    backgroundColor: "#1e40af",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10),
    marginTop: verticalScale(1),
  },
  listIndexText: {
    color: "#dbeafe",
    fontSize: moderateScale(11),
    fontWeight: "800",
  },
  listContent: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
  },
  listLabel: {
    color: "#fde68a",
    fontSize: moderateScale(12),
    fontWeight: "700",
    marginBottom: verticalScale(4),
  },
  listText: {
    color: "#cbd5e1",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
  },
  code: {
    color: "#cbd5e1",
    fontFamily: "Courier New",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
});
