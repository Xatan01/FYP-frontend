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
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

// Free Lottie animation for the trophy
const LOTTIE_TROPHY = "https://lottie.host/80a37368-e374-4861-8318-39b1103c3f6c/3O2f2rA7Yv.json";

// Mock data for the leaderboard
const leaderboard = [
  { id: 1, name: "Jessica L.", xp: 4120, avatar: "https://placehold.co/100x100/a855f7/ffffff?text=JL" },
  { id: 2, name: "Michael T.", xp: 3890, avatar: "https://placehold.co/100x100/f59e0b/ffffff?text=MT" },
  { id: 3, name: "You (Alex)", xp: 3550, avatar: "https://placehold.co/100x100/2563eb/ffffff?text=A" },
  { id: 4, name: "Sarah K.", xp: 3210, avatar: "https://placehold.co/100x100/16a34a/ffffff?text=SK" },
  { id: 5, name: "David P.", xp: 2900, avatar: "https://placehold.co/100x100/64748b/ffffff?text=DP" },
];

export default function Leagues() {
  const myUser = leaderboard.find((u) => u.name.includes("You"));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Your League</Text>

        {/* League Card */}
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
            <Text style={styles.leagueName}>Gold League</Text>
            <Text style={styles.leagueSubtitle}>Top 10% of users</Text>
          </View>
        </LinearGradient>

        <Text style={styles.leaderboardHeader}>Leaderboard</Text>

        {/* Leaderboard */}
        <View style={styles.leaderboard}>
          {leaderboard.map((user, index) => {
            const isMe = user.id === myUser.id;
            return (
              <View
                key={user.id}
                style={[
                  styles.row,
                  isMe && styles.myRow, // Highlight the current user
                ]}
              >
                <Text style={styles.rank}>{index + 1}</Text>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <Text style={[styles.name, isMe && { fontWeight: "bold" }]}>
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
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1 },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(12),
  },
  leagueCard: {
    borderRadius: 16,
    padding: scale(16),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(20),
    overflow: "hidden",
  },
  lottie: {
    width: scale(70),
    height: scale(70),
    marginRight: scale(8),
  },
  leagueName: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#fff",
  },
  leagueSubtitle: {
    fontSize: moderateScale(13),
    color: "#fef3c7",
  },
  leaderboardHeader: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: verticalScale(8),
  },
  leaderboard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: scale(8),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(8),
    borderRadius: 12,
  },
  myRow: {
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  rank: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#64748b",
    width: scale(30),
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  name: {
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