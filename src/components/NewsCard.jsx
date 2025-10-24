import { View, Text, StyleSheet } from "react-native";
import { Newspaper } from "lucide-react-native";

const news = [
  { title: "Singapore GDP beats forecasts", source: "Business Times", time: "2h ago" },
  { title: "REITs remain strong amid rates", source: "Straits Times", time: "5h ago" },
];

export default function NewsCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Latest Financial News</Text>
      {news.map((n) => (
        <View key={n.title} style={styles.newsRow}>
          <View style={styles.iconCircle}>
            <Newspaper size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>{n.title}</Text>
            <Text style={styles.meta}>{n.source} • {n.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  header: { fontSize: 12, color: "#64748b", marginBottom: 12 },
  newsRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  meta: { fontSize: 12, color: "#64748b", marginTop: 2 },
});
