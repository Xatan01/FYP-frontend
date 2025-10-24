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

export default function Consult() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Book a Consultation</Text>

        {advisors.map((a, i) => (
          <TouchableOpacity key={i} style={styles.card}>
            <Image source={{ uri: a.avatar }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{a.name}</Text>
              <Text style={styles.specialty}>{a.specialty}</Text>
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
  header: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: verticalScale(12),
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    alignItems: "center",
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
});
