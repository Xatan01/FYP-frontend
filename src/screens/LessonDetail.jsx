import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

function renderJson(value) {
  if (value == null) return "No JSON blob found.";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function LessonDetail({ route, navigation }) {
  const {
    topicId,
    topicName,
    subtopicId,
    subtopicName,
    contentId,
    contentTitle,
    difficulty,
    summary,
    contentJson,
  } = route.params || {};

  console.log("[LessonDetail] opened", {
    topicId,
    subtopicId,
    contentId,
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{contentTitle ?? `Content ${contentId ?? ""}`.trim()}</Text>
        <Text style={styles.summaryText}>
          {topicName ?? "Topic"} • {subtopicName ?? "Subtopic"}
        </Text>

        <Text style={styles.meta}>Topic ID: {topicId ?? "-"}</Text>
        <Text style={styles.meta}>Subtopic ID: {subtopicId ?? "-"}</Text>
        <Text style={styles.meta}>Content ID: {contentId ?? "-"}</Text>
        <Text style={styles.meta}>Difficulty: {difficulty ?? "-"}</Text>

        {summary ? (
          <>
            <Text style={styles.blockLabel}>Summary</Text>
            <Text style={styles.content}>{summary}</Text>
          </>
        ) : null}

        <Text style={styles.blockLabel}>JSON Blob</Text>
        <Text style={styles.code}>{renderJson(contentJson)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220" },
  container: { padding: scale(20), paddingBottom: verticalScale(40) },
  backBtn: { marginBottom: verticalScale(12), alignSelf: "flex-start" },
  backBtnText: { color: "#60a5fa", fontSize: moderateScale(14), fontWeight: "700" },
  title: {
    color: "#f8fafc",
    fontSize: moderateScale(26),
    fontWeight: "800",
    marginBottom: verticalScale(8),
  },
  summaryText: { color: "#94a3b8", fontSize: moderateScale(14), marginBottom: verticalScale(10) },
  blockLabel: {
    color: "#93c5fd",
    fontSize: moderateScale(12),
    fontWeight: "700",
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
  },
  meta: { color: "#94a3b8", fontSize: moderateScale(12), marginBottom: verticalScale(6) },
  content: {
    color: "#cbd5e1",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
  },
  code: {
    color: "#cbd5e1",
    fontFamily: "Courier",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
});
