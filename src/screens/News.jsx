import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Newspaper, TrendingUp } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

const newsItems = [
  {
    id: "n1",
    title: "Singapore REITs extend gains on rate pause signals",
    source: "Straits Times",
    time: "1h ago",
    tag: "REITs",
  },
  {
    id: "n2",
    title: "Tech stocks rebound as earnings beat expectations",
    source: "Business Times",
    time: "3h ago",
    tag: "Equities",
  },
  {
    id: "n3",
    title: "Oil edges higher on supply concerns",
    source: "Reuters",
    time: "5h ago",
    tag: "Commodities",
  },
  {
    id: "n4",
    title: "Analysts raise outlook for Singapore banks",
    source: "CNA",
    time: "8h ago",
    tag: "Banking",
  },
];

export default function News() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Market News</Text>
          <View style={styles.pill}>
            <TrendingUp size={14} color="#16a34a" />
            <Text style={styles.pillText}>Live</Text>
          </View>
        </View>

        {newsItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <View style={styles.iconCircle}>
              <Newspaper size={18} color="#fff" />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.meta}>
                {item.source} - {item.time}
              </Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    backgroundColor: "#ecfdf3",
    borderRadius: 999,
  },
  pillText: { color: "#16a34a", fontWeight: "600", fontSize: moderateScale(12) },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
  },
  textBlock: { flex: 1 },
  title: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  meta: { fontSize: moderateScale(12), color: "#64748b", marginTop: 2 },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    marginTop: verticalScale(6),
  },
  tagText: { color: "#2563eb", fontSize: moderateScale(11), fontWeight: "600" },
});
