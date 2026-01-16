import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import {
  scale,
  verticalScale,
  moderateScale,
} from "../styles/responsive";

// Your original mock data
const advisors = [
  {
    name: "Sarah Lee",
    specialty: "Wealth Management",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  {
    name: "Jonathan Tan",
    specialty: "REIT & Property Investing",
    avatar: "https://cdn-icons-png.flaticon.com/512/2202/2202112.png",
  },
];

export default function Consult({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Book a Consultation</Text>

        {advisors.map((a, i) => (
          <TouchableOpacity key={i} style={styles.card} activeOpacity={0.8}>
            <Image source={{ uri: a.avatar }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{a.name}</Text>
              <Text style={styles.specialty}>{a.specialty}</Text>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => navigation.navigate("ChatConsult")}
              >
                <Text style={styles.chatText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Your original styles, with minor tweaks
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  header: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(12),
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    marginRight: scale(12),
  },
  textContainer: { flex: 1 },
  name: { fontSize: moderateScale(15), fontWeight: "600", color: "#0f172a" },
  specialty: { fontSize: moderateScale(12), color: "#475569", marginTop: 2 },
  chatButton: {
    marginTop: verticalScale(8),
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    borderRadius: scale(10),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
  },
  chatText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
});
