import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
  useWindowDimensions,
} from "../styles/responsive";
import PortfolioCard from "../components/PortfolioCard";
import NewsCard from "../components/NewsCard";
import { Shield, Star, Play, Brain, ArrowRight } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Free Lottie animation for the streak flame
const LOTTIE_FLAME = "https://lottie.host/0f6b4d3c-1191-4e4f-b1e0-466a9bafaa26/uNFITb1eim.json";
// Free Lottie animation for the robot mascot
const LOTTIE_ROBOT = "https://lottie.host/1b98b9a2-67c4-406e-8e89-322141c2d0f3/fW13a22k1D.json";

// AI-generated recommendation
const aiRecommendation = {
  title: "AI-Powered Challenge",
  description: "Our AI notes you're watching REITs. Unlock the 'Advanced REITs' module to learn more!",
  xp: 100,
  action: "Learn", // This would navigate to the Learn tab
};

export default function Home({ userData, learningPath, navigation }) {
  const { width } = useWindowDimensions();

  // Find the next lesson for the "Continue" button
  let nextLesson = null;
  for (const unit of learningPath) {
    const lesson = unit.lessons.find((l) => l.status === "unlocked");
    if (lesson) {
      nextLesson = lesson;
      break;
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={[styles.container, { paddingHorizontal: width * 0.04 }]}
        contentContainerStyle={{ paddingBottom: verticalScale(24) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          Welcome back, <Text style={styles.name}>{userData.name}</Text>
        </Text>
        
        {/* --- Gamified Stats Bar --- */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Star size={20} color="#f59e0b" />
            <Text style={styles.statText}>{userData.xp} XP</Text>
          </View>
          <View style={styles.statItem}>
            <LottieView
              source={{ uri: LOTTIE_FLAME }}
              autoPlay
              loop
              style={{ width: 28, height: 28 }}
            />
            <Text style={styles.statText}>{userData.streak} Day Streak</Text>
          </View>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate("Profile")} // Go to Profile
          >
            <Shield size={20} color="#16a34a" />
            <Text style={styles.statText}>{userData.league} League</Text>
          </TouchableOpacity>
        </View>

        {/* --- Main Cards --- */}
        <View style={{ gap: verticalScale(16) }}>
          {/* --- Continue Learning Card --- */}
          {nextLesson && (
            <TouchableOpacity
              style={styles.learnCard}
              onPress={() => navigation.navigate("Learn")}
            >
              <LinearGradient
                colors={["#22c55e", "#15803d"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View>
                <Text style={styles.learnTitle}>Continue Learning</Text>
                <Text style={styles.learnSubtitle}>{nextLesson.title}</Text>
              </View>
              <Play size={24} color="#fff" />
            </TouchableOpacity>
          )}

          {/* --- AI Recommendation Card --- */}
          <TouchableOpacity 
            style={styles.aiCard}
            onPress={() => navigation.navigate(aiRecommendation.action)}
          >
            <View style={styles.aiTextContainer}>
              <View style={styles.aiHeader}>
                <Brain size={16} color="#a855f7" />
                <Text style={styles.aiTitle}>{aiRecommendation.title}</Text>
              </View>
              <Text style={styles.aiDescription}>{aiRecommendation.description}</Text>
              <Text style={styles.aiReward}>Earn +{aiRecommendation.xp} XP</Text>
            </View>
            <LottieView source={{ uri: LOTTIE_ROBOT }} autoPlay loop style={styles.aiLottie} />
          </TouchableOpacity>

          <PortfolioCard />
          <NewsCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Add these new styles to your existing Home styles
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
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: scale(12),
    marginVertical: verticalScale(16),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#334155",
    marginLeft: scale(4),
  },
  learnCard: {
    borderRadius: 16,
    padding: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  learnTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#fff",
  },
  learnSubtitle: {
    fontSize: moderateScale(13),
    color: "#f0f9ff",
    marginTop: 2,
  },
  // New AI Card Styles
  aiCard: {
    backgroundColor: "#f3e8ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e9d5ff",
    padding: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: 'hidden',
  },
  aiTextContainer: {
    flex: 1,
    paddingRight: scale(8),
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  aiTitle: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: "#6b21a8",
    marginLeft: scale(4),
  },
  aiDescription: {
    fontSize: moderateScale(12),
    color: "#581c87",
    marginBottom: verticalScale(6),
  },
  aiReward: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    color: "#6b21a8",
  },
  aiLottie: {
    width: scale(70),
    height: scale(70),
    marginLeft: scale(4),
  },
  // Subtitle from your original file
  subtitle: {
    fontSize: moderateScale(13),
    color: "#64748b",
    marginBottom: verticalScale(4), // Adjusted margin
  },
});