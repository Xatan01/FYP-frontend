import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Calendar, Clock, CheckCircle2 } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

const dates = ["Nov 10", "Nov 11", "Nov 12", "Nov 13", "Nov 14"];
const slots = ["09:30", "11:00", "14:00", "15:30", "17:00"];

export default function ConsultationBooking({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState(slots[1]);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => navigation.navigate("ChatConsult"), 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Book Consultation</Text>
        <Text style={styles.subtitle}>
          Choose a time to meet with a certified advisor.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={16} color="#2563eb" />
            <Text style={styles.sectionTitle}>Date</Text>
          </View>
          <View style={styles.pillRow}>
            {dates.map((date) => {
              const active = date === selectedDate;
              return (
                <TouchableOpacity
                  key={date}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color="#16a34a" />
            <Text style={styles.sectionTitle}>Time</Text>
          </View>
          <View style={styles.pillRow}>
            {slots.map((slot) => {
              const active = slot === selectedSlot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm Booking</Text>
        </TouchableOpacity>

        {confirmed && (
          <View style={styles.confirmed}>
            <CheckCircle2 size={16} color="#16a34a" />
            <Text style={styles.confirmedText}>
              Booked for {selectedDate} at {selectedSlot}.
            </Text>
          </View>
        )}
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
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: "#64748b",
    marginBottom: verticalScale(16),
  },
  section: { marginBottom: verticalScale(16) },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#0f172a",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginTop: verticalScale(10),
  },
  pill: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  pillActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  pillText: { fontSize: moderateScale(12), color: "#475569", fontWeight: "600" },
  pillTextActive: { color: "#fff" },
  confirmButton: {
    backgroundColor: "#16a34a",
    borderRadius: 16,
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontSize: moderateScale(14), fontWeight: "700" },
  confirmed: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginTop: verticalScale(12),
  },
  confirmedText: { color: "#16a34a", fontSize: moderateScale(12) },
});
