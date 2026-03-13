import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
  useWindowDimensions,
} from "../styles/responsive";
import NewsCard from "../components/NewsCard";
import {
  Shield,
  Star,
  Play,
  Brain,
  BarChart3,
  LineChart,
  Eye,
  Newspaper,
  NotebookPen,
  Sparkles,
  Trophy,
  ShoppingBag,
} from "lucide-react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";

// Free Lottie animation for the streak flame
const LOTTIE_FLAME = "https://lottie.host/0f6b4d3c-1191-4e4f-b1e0-466a9bafaa26/uNFITb1eim.json";
// Free Lottie animation for the robot mascot
const LOTTIE_ROBOT = "https://lottie.host/1b98b9a2-67c4-406e-8e89-322141c2d0f3/fW13a22k1D.json";

// AI-generated recommendation
const aiRecommendation = {
  title: "AI Insights",
  description: "See today's model signals for your watchlist and sector trends.",
  xp: 100,
  action: "AiInsights",
};

export default function Home({ userData, learningPath, navigation }) {
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const safeUser = userData ?? { name: "User", xp: 0, streak: 0, league: "Bronze" };
  const safeLearningPath = Array.isArray(learningPath) ? learningPath : [];

  const quickActions = [
    {
      label: "Virtual Market",
      description: "Practice entries and exits without risking capital.",
      icon: LineChart,
      route: "VirtualMarket",
      tone: "#0f766e",
    },
    {
      label: "Journal",
      description: "Capture trade notes, setups, and post-trade reviews.",
      icon: NotebookPen,
      route: "TradingJournal",
      tone: "#0ea5e9",
    },
    {
      label: "Watchlist",
      description: "Track saved names and open your top ideas faster.",
      icon: Eye,
      route: "Watchlist",
      tone: "#2563eb",
    },
    {
      label: "Charting Tools",
      description: "Open live charts and layer indicators across timeframes.",
      icon: BarChart3,
      route: "Charting",
      tone: "#1d4ed8",
    },
    {
      label: "AI Insights",
      description: "Review model signals tied to your watchlist and sectors.",
      icon: Sparkles,
      route: "AiInsights",
      tone: "#f59e0b",
    },
    {
      label: "News",
      description: "Scan the latest headlines affecting markets and themes.",
      icon: Newspaper,
      route: "News",
      tone: "#b45309",
    },
    {
      label: "Leaderboard",
      description: "See how your progress stacks up against the community.",
      icon: Trophy,
      route: "Community",
      tone: "#8b5cf6",
    },
    {
      label: "Shop",
      description: "Browse profile rewards and unlockable customizations.",
      icon: ShoppingBag,
      route: "Profile",
      tone: "#6366f1",
    },
  ];

  // Find the next lesson for the "Continue" button
  let nextLesson = null;
  for (const unit of safeLearningPath) {
    const lessons = Array.isArray(unit?.lessons) ? unit.lessons : [];
    const lesson = lessons.find((l) => l?.status === "unlocked");
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
          Welcome back, <Text style={styles.name}>{safeUser.name}</Text>
        </Text>
        
        {/* --- Gamified Stats Bar --- */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Star size={20} color="#f59e0b" />
            <Text style={styles.statText}>{safeUser.xp} XP</Text>
          </View>
          <View style={styles.statItem}>
            <LottieView
              source={{ uri: LOTTIE_FLAME }}
              autoPlay
              loop
              style={{ width: 28, height: 28 }}
            />
            <Text style={styles.statText}>{safeUser.streak} Day Streak</Text>
          </View>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate("Profile")} // Go to Profile
          >
            <Shield size={20} color="#16a34a" />
            <Text style={styles.statText}>{safeUser.league} League</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickCard}
              onPress={() => navigation.navigate(action.route)}
            >
              <View style={[styles.quickIcon, { backgroundColor: action.tone }]}>
                <action.icon size={18} color="#fff" />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
              <Text style={styles.quickDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
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
                colors={isLight ? ["#22c55e", "#15803d"] : ["#166534", "#14532d"]}
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

          <NewsCard onPress={() => navigation.navigate("News")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Add these new styles to your existing Home styles
function buildStyles(palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: { flex: 1 },
    greeting: {
      fontSize: moderateScale(24),
      fontWeight: "bold",
      color: palette.textPrimary,
      marginTop: verticalScale(4),
    },
    name: { color: palette.accent },
    statsBar: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: scale(12),
      marginVertical: verticalScale(16),
      shadowColor: palette.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
      borderWidth: 1,
      borderColor: palette.cardBorder,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statText: {
      fontSize: moderateScale(13),
      fontWeight: "600",
      color: palette.textSecondary,
      marginLeft: scale(4),
    },
    sectionHeader: {
      fontSize: moderateScale(16),
      fontWeight: "700",
      color: palette.textPrimary,
      marginBottom: verticalScale(10),
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(12),
      marginBottom: verticalScale(6),
    },
    quickCard: {
      width: "48%",
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: scale(12),
      borderWidth: 1,
      borderColor: palette.cardBorder,
      minHeight: verticalScale(120),
    },
    quickIcon: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(8),
    },
    quickLabel: {
      fontSize: moderateScale(12),
      fontWeight: "700",
      color: palette.textPrimary,
      marginBottom: verticalScale(4),
    },
    quickDescription: {
      fontSize: moderateScale(10.5),
      lineHeight: moderateScale(15),
      color: palette.textSecondary,
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
      color: palette.white,
    },
    learnSubtitle: {
      fontSize: moderateScale(13),
      color: "#f0f9ff",
      marginTop: 2,
    },
    aiCard: {
      backgroundColor: palette.purpleSoft,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.purpleBorder,
      padding: scale(16),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
    },
    aiTextContainer: {
      flex: 1,
      paddingRight: scale(8),
    },
    aiHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(4),
    },
    aiTitle: {
      fontSize: moderateScale(14),
      fontWeight: "bold",
      color: palette.purpleText,
      marginLeft: scale(4),
    },
    aiDescription: {
      fontSize: moderateScale(12),
      color: palette.purpleText,
      marginBottom: verticalScale(6),
    },
    aiReward: {
      fontSize: moderateScale(12),
      fontWeight: "bold",
      color: palette.purpleText,
    },
    aiLottie: {
      width: scale(70),
      height: scale(70),
      marginLeft: scale(4),
    },
    subtitle: {
      fontSize: moderateScale(13),
      color: palette.textMuted,
      marginBottom: verticalScale(4),
    },
  });
}
