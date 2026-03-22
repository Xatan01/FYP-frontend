import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
  useWindowDimensions,
} from "../styles/responsive";
import {
  Shield,
  Star,
  Play,
  Brain,
  ArrowUpRight,
  Bot,
  BarChart3,
  LineChart,
  Eye,
  MessageCircle,
  Newspaper,
  NotebookPen,
  Sparkles,
  Trophy,
  ShoppingBag,
} from "lucide-react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";

const LOTTIE_FLAME = "https://lottie.host/0f6b4d3c-1191-4e4f-b1e0-466a9bafaa26/uNFITb1eim.json";
const LOTTIE_ROBOT = "https://lottie.host/1b98b9a2-67c4-406e-8e89-322141c2d0f3/fW13a22k1D.json";

const aiRecommendation = {
  title: "AI Insights",
  description: "Signals and insight modules will live here once this feature is ready.",
  status: "Coming soon",
  action: "AiInsights",
};

const traderFeature = {
  label: "AI Trader Personalities",
  description: "Compare conservative, balanced, and aggressive model signals on the same stock.",
  icon: Brain,
  route: "AITraderPersonalities",
  tone: "#0f766e",
};

const traderPreviewProfiles = [
  { label: "Conservative", tone: "#0ea5e9" },
  { label: "Balanced", tone: "#22c55e" },
  { label: "Aggressive", tone: "#f97316" },
];

export default function Home({ userData, learningPath, navigation }) {
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette, isLight), [palette, isLight]);
  const { width } = useWindowDimensions();
  const safeUser = userData ?? { name: "User", xp: 0, streak: 0, league: "Bronze" };
  const safeLearningPath = Array.isArray(learningPath) ? learningPath : [];
  const TraderFeatureIcon = traderFeature.icon;

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
      route: "WatchlistTab",
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
      label: "FinBot",
      description: "Open the trading chatbot for guided questions and in-app help.",
      icon: Bot,
      route: "FinBot",
      tone: "#7c3aed",
    },
    {
      label: "Consult",
      description: "Chat with or book a human advisor when you need direct help.",
      icon: MessageCircle,
      route: "Consult",
      tone: "#0891b2",
    },
    {
      label: "AI Insights",
      description: "Reserved space for future article-level summaries and contextual insights.",
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
            onPress={() => navigation.navigate("Profile")}
          >
            <Shield size={20} color="#16a34a" />
            <Text style={styles.statText}>{safeUser.league} League</Text>
          </TouchableOpacity>
        </View>

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
            <Text style={styles.aiReward}>{aiRecommendation.status}</Text>
          </View>
          <LottieView source={{ uri: LOTTIE_ROBOT }} autoPlay loop style={styles.aiLottie} />
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Actions</Text>
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

        <View style={styles.bottomSection}>
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

          <TouchableOpacity
            style={styles.featuredTraderCard}
            onPress={() => navigation.navigate(traderFeature.route)}
          >
            <LinearGradient
              colors={
                isLight
                  ? ["#ecfeff", "#eff6ff", "#ffffff"]
                  : ["#0b3b35", "#0f172a", "#111827"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredTraderGradient}
            >
              <View style={styles.featuredTraderGlow} />

              <View style={styles.featuredTraderTopRow}>
                <Text style={styles.featuredTraderEyebrow}>Featured AI Lab</Text>
                <View style={styles.featuredTraderTopPill}>
                  <Text style={styles.featuredTraderTopPillText}>3 personalities</Text>
                </View>
              </View>

              <View style={styles.featuredTraderHeroRow}>
                <View style={styles.featuredTraderBody}>
                  <Text style={styles.featuredTraderTitle}>{traderFeature.label}</Text>
                  <Text style={styles.featuredTraderDescription}>{traderFeature.description}</Text>
                </View>

                <View style={styles.featuredTraderVisual}>
                  <View style={[styles.featuredTraderIconHalo, { borderColor: `${traderFeature.tone}44` }]}>
                    <View style={[styles.featuredTraderIcon, { backgroundColor: traderFeature.tone }]}>
                      <TraderFeatureIcon size={22} color="#fff" />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.featuredTraderProfileRow}>
                {traderPreviewProfiles.map((profile) => (
                  <View key={profile.label} style={styles.featuredTraderProfilePill}>
                    <View style={[styles.featuredTraderProfileDot, { backgroundColor: profile.tone }]} />
                    <Text style={styles.featuredTraderProfileText}>{profile.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.featuredTraderFooter}>
                <Text style={styles.featuredTraderFooterText}>
                  Side-by-side signals, thresholds, and sizing logic.
                </Text>
                <View style={styles.featuredTraderCTA}>
                  <Text style={styles.featuredTraderCTAText}>Open</Text>
                  <ArrowUpRight size={15} color={palette.accentSoftText} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function buildStyles(palette, isLight) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: { flex: 1, marginTop: "3%" },
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
      marginTop: "10%",
      fontSize: moderateScale(16),
      fontWeight: "700",
      color: palette.textPrimary,
      marginBottom: verticalScale(10),
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: verticalScale(12),
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
    bottomSection: {
      gap: verticalScale(16),
      marginTop: verticalScale(16),
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
    featuredTraderCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      overflow: "hidden",
      shadowColor: palette.shadow,
      shadowOpacity: isLight ? 0.09 : 0.22,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    featuredTraderGradient: {
      padding: scale(18),
      gap: verticalScale(14),
      position: "relative",
    },
    featuredTraderGlow: {
      position: "absolute",
      width: scale(140),
      height: scale(140),
      borderRadius: scale(999),
      backgroundColor: isLight ? "rgba(37, 99, 235, 0.09)" : "rgba(45, 212, 191, 0.12)",
      top: -scale(40),
      right: -scale(28),
    },
    featuredTraderTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: scale(12),
    },
    featuredTraderTopPill: {
      borderRadius: scale(999),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      backgroundColor: isLight ? "rgba(255,255,255,0.78)" : "rgba(15, 23, 42, 0.58)",
      borderWidth: 1,
      borderColor: isLight ? "rgba(148, 163, 184, 0.22)" : "rgba(148, 163, 184, 0.2)",
    },
    featuredTraderTopPillText: {
      color: palette.textSecondary,
      fontSize: moderateScale(11),
      fontWeight: "800",
    },
    featuredTraderHeroRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(14),
    },
    featuredTraderIcon: {
      width: scale(54),
      height: scale(54),
      borderRadius: scale(20),
      alignItems: "center",
      justifyContent: "center",
    },
    featuredTraderIconHalo: {
      width: scale(76),
      height: scale(76),
      borderRadius: scale(28),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      backgroundColor: isLight ? "rgba(255,255,255,0.72)" : "rgba(15, 23, 42, 0.4)",
    },
    featuredTraderBody: {
      flex: 1,
    },
    featuredTraderVisual: {
      alignItems: "center",
      justifyContent: "center",
    },
    featuredTraderEyebrow: {
      fontSize: moderateScale(11),
      fontWeight: "800",
      color: isLight ? "#0f766e" : "#5eead4",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    featuredTraderTitle: {
      fontSize: moderateScale(18),
      fontWeight: "900",
      color: palette.textPrimary,
      marginBottom: verticalScale(6),
    },
    featuredTraderDescription: {
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
      color: palette.textSecondary,
    },
    featuredTraderProfileRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
    },
    featuredTraderProfilePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(7),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
      borderRadius: scale(999),
      backgroundColor: isLight ? "rgba(255,255,255,0.76)" : "rgba(15, 23, 42, 0.54)",
      borderWidth: 1,
      borderColor: isLight ? "rgba(203, 213, 225, 0.9)" : "rgba(51, 65, 85, 0.9)",
    },
    featuredTraderProfileDot: {
      width: scale(8),
      height: scale(8),
      borderRadius: scale(999),
    },
    featuredTraderProfileText: {
      color: palette.textSecondary,
      fontSize: moderateScale(11),
      fontWeight: "700",
    },
    featuredTraderFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: scale(12),
    },
    featuredTraderFooterText: {
      flex: 1,
      fontSize: moderateScale(11.5),
      lineHeight: moderateScale(17),
      color: palette.textMuted,
    },
    featuredTraderCTA: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
      borderRadius: scale(999),
      backgroundColor: palette.accentSoft,
      borderWidth: 1,
      borderColor: isLight ? "rgba(37, 99, 235, 0.12)" : "rgba(147, 197, 253, 0.16)",
    },
    featuredTraderCTAText: {
      color: palette.accentSoftText,
      fontSize: moderateScale(11),
      fontWeight: "800",
    },
    subtitle: {
      fontSize: moderateScale(13),
      color: palette.textMuted,
      marginBottom: verticalScale(4),
    },
  });
}

