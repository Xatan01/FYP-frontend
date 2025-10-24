import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
} from "../styles/responsive";
import LottieView from "lottie-react-native";
import { MessageCircle } from "lucide-react-native";

// Free Lottie animation for the robot
const LOTTIE_ROBOT = "https://lottie.host/1b98b9a2-67c4-406e-8e89-322141c2d0f3/fW13a22k1D.json";

// You can move this data inside the component
const predictions = [
  { asset: "DBS Group Holdings", signal: "Bullish", confidence: 0.84 },
  { asset: "CapitaLand REIT", signal: "Neutral", confidence: 0.63 },
  { asset: "Keppel Corp", signal: "Bearish", confidence: 0.77 },
];

export default function AiInsights() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16), alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>AI Robo-Advisor</Text>

        {/* Mascot */}
        <LottieView
          source={{ uri: LOTTIE_ROBOT }}
          autoPlay
          loop
          style={styles.lottie}
        />

        <Text style={styles.introText}>
          Hi! I'm <Text style={{ fontWeight: "bold", color: "#6b21a8" }}>FinBot</Text>. 
          Here are some insights I've generated for you:
        </Text>

        {predictions.map((p, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.asset}>{p.asset}</Text>
            <Text
              style={[
                styles.signal,
                p.signal === "Bullish"
                  ? { color: "#16a34a" }
                  : p.signal === "Bearish"
                  ? { color: "#dc2626" }
                  : { color: "#d97706" },
              ]}
            >
              {p.signal} • {Math.round(p.confidence * 100)}% confidence
            </Text>
          </View>
        ))}

        <TouchableOpacity style={styles.chatButton}>
          <MessageCircle size={20} color="#fff" />
          <Text style={styles.chatButtonText}>Chat with FinBot</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(4),
  },
  lottie: {
    width: scale(180),
    height: scale(180),
  },
  introText: {
    fontSize: moderateScale(14),
    color: "#475569",
    textAlign: "center",
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(16),
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: scale(16),
    marginBottom: verticalScale(10),
    width: "100%",
  },
  asset: { fontSize: moderateScale(14), fontWeight: "600", color: "#0f172a" },
  signal: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    marginTop: verticalScale(4),
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a855f7",
    borderRadius: 25,
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    marginTop: verticalScale(12),
    shadowColor: "#a855f7",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
    marginLeft: scale(8),
  },
});