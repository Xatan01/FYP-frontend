import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
  useWindowDimensions,
} from "../styles/responsive";
import PortfolioCard from "../components/PortfolioCard";
import MarketMoversCard from "../components/MarketMoversCard";
import NewsCard from "../components/NewsCard";
import NavigationButtons from "../components/NavigationButtons";

export default function Home() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={[styles.container, { paddingHorizontal: width * 0.04 }]}
        contentContainerStyle={{ paddingBottom: verticalScale(24) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          Welcome back, <Text style={styles.name}>Alex</Text>
        </Text>
        <Text style={styles.subtitle}>Here's your investment overview</Text>

        <View style={{ gap: verticalScale(16) }}>
          <PortfolioCard />
          <MarketMoversCard />
          <NewsCard />
          <NavigationButtons />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1 },
  greeting: {
    fontSize: moderateScale(24),
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: verticalScale(4),
  },
  name: { color: "#2563eb" },
  subtitle: {
    fontSize: moderateScale(13),
    color: "#64748b",
    marginBottom: verticalScale(12),
  },
});
