import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
} from "../styles/responsive";
import {
  Award,
  BarChart2,
  Brain,
  Home,
  Lock,
  Play,
  Shield,
  Star,
} from "lucide-react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Free Lottie animation for the streak flame
const LOTTIE_FLAME = "https://lottie.host/0f6b4d3c-1191-4e4f-b1e0-466a9bafaa26/uNFITb1eim.json";
// Free Lottie animation for the trophy
const LOTTIE_TROPHY = "https://lottie.host/80a37368-e374-4861-8318-39b1103c3f6c/3O2f2rA7Yv.json";

// Mock data for achievements 
const achievements = [
  { id: "a1", title: "First Steps", icon: Play, earned: true },
  { id: "a2", title: "Stock Savvy", icon: BarChart2, earned: true },
  { id: "a3", title: "REIT Ready", icon: Home, earned: false },
  { id: "a4", title: "AI Analyst", icon: Brain, earned: true },
  { id: "a5", title: "Week Streak", icon: Award, earned: false },
  { id: "a6", title: "Top 3", icon: Shield, earned: true },
];

// Mock data for the leaderboard
const leaderboard = [
  { id: 1, name: "Jessica L.", xp: 4120, avatar: "https://placehold.co/100x100/a855f7/ffffff?text=JL" },
  { id: 2, name: "Michael T.", xp: 3890, avatar: "https://placehold.co/100x100/f59e0b/ffffff?text=MT" },
  { id: 3, name: "You (Alex)", xp: 3550, avatar: "https://placehold.co/100x100/2563eb/ffffff?text=A" },
  { id: 4, name: "Sarah K.", xp: 3210, avatar: "https://placehold.co/100x100/16a34a/ffffff?text=SK" },
];

export default function Profile({ userData }) {
  const myUser = leaderboard.find((u) => u.name.includes("You"));
  
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16), alignItems: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: "https://placehold.co/120x120/2563eb/ffffff?text=A" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.joined}>Joined December 2024</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Star size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{userData.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <LottieView
              source={{ uri: LOTTIE_FLAME }}
              autoPlay
              loop
              style={{ width: 32, height: 32 }}
            />
            <Text style={styles.statValue}>{userData.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Shield size={24} color="#16a34a" />
            <Text style={styles.statValue}>{userData.league}</Text>
            <Text style={styles.statLabel}>League</Text>
          </View>
        </View>

        {/* Achievements  */}
        <Text style={styles.sectionHeader}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badge,
                badge.earned ? styles.badgeEarned : styles.badgeLocked,
              ]}
            >
              {badge.earned ? (
                <badge.icon size={32} color="#b45309" />
              ) : (
                <Lock size={32} color="#94a3b8" />
              )}
              <Text
                style={[
                  styles.badgeText,
                  !badge.earned && { color: "#94a3b8" },
                ]}
                numberOfLines={2}
              >
                {badge.title}
              </Text>
            </View>
          ))}
        </View>
        
        {/* League / Leaderboard */}
        <Text style={styles.sectionHeader}>Gold League</Text>
        <LinearGradient
          colors={["#f59e0b", "#b45309"]}
          style={styles.leagueCard}
        >
          <LottieView
            source={{ uri: LOTTIE_TROPHY }}
            autoPlay
            loop
            style={styles.lottie}
          />
          <View>
            <Text style={styles.leagueName}>You're in the Top 10%!</Text>
            <Text style={styles.leagueSubtitle}>Keep up the great work</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.leaderboard}>
          {leaderboard.map((user, index) => {
            const isMe = user.id === myUser.id;
            return (
              <View
                key={user.id}
                style={[ styles.row, isMe && styles.myRow ]}
              >
                <Text style={styles.rank}>{index + 1}</Text>
                <Image source={{ uri: user.avatar }} style={styles.rowAvatar} />
                <Text style={[styles.rowName, isMe && { fontWeight: "bold" }]}>
                  {user.name}
                </Text>
                <Text style={styles.xp}>{user.xp} XP</Text>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  avatar: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    borderWidth: 3,
    borderColor: "#2563eb",
    marginTop: verticalScale(10),
  },
  name: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: verticalScale(8),
  },
  joined: {
    fontSize: moderateScale(13),
    color: "#64748b",
    marginBottom: verticalScale(20),
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: verticalScale(20),
  },
  statCard: {
    width: "32%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: scale(12),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#0f172a",
    marginVertical: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: "#64748b",
  },
  sectionHeader: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: verticalScale(12),
    alignSelf: "flex-start",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: '100%',
    marginBottom: verticalScale(12),
  },
  badge: {
    width: "32%",
    height: scale(100),
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: scale(8),
    marginBottom: scale(8),
  },
  badgeEarned: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  badgeLocked: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  badgeText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#b45309",
    textAlign: "center",
    marginTop: verticalScale(4),
  },
  leagueCard: {
    width: '100%',
    borderRadius: 16,
    padding: scale(16),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
    overflow: "hidden",
  },
  lottie: {
    width: scale(70),
    height: scale(70),
    marginRight: scale(8),
  },
  leagueName: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
    color: "#fff",
  },
  leagueSubtitle: {
    fontSize: moderateScale(13),
    color: "#fef3c7",
  },
  leaderboard: {
    width: '100%',
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: scale(8),
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(8),
    borderRadius: 12,
  },
  myRow: {
    backgroundColor: "#e0f2fe",
  },
  rank: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#64748b",
    width: scale(30),
  },
  rowAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  rowName: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#0f172a",
  },
  xp: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#0f172a",
  },
});