import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Calendar, Clock, CheckCircle2 } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import {
  createConsultationBooking,
  markConsultationBooked,
} from "../api/consultation";

const SLOT_OPTIONS = ["09:30", "11:00", "14:00", "15:30", "17:00"];

function buildDateChoices() {
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    const label = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return { label, date };
  });
}

function combineDateAndSlot(dateObj, slot) {
  if (!dateObj || !slot) return null;
  const [hourStr, minStr] = String(slot).split(":");
  const next = new Date(dateObj);
  next.setHours(Number(hourStr) || 0, Number(minStr) || 0, 0, 0);
  return next.toISOString();
}

export default function ConsultationBooking({ navigation, route }) {
  const expert = route?.params?.expert || null;
  const existingBooking = route?.params?.booking || null;

  const expertName = expert?.display_name || existingBooking?.expert?.display_name || "Advisor";
  const expertId = Number(expert?.expert_id || existingBooking?.expert?.expert_id);

  const dateChoices = useMemo(() => buildDateChoices(), []);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(SLOT_OPTIONS[1]);
  const [topic, setTopic] = useState(String(existingBooking?.topic || ""));
  const [initialMessage, setInitialMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmedText, setConfirmedText] = useState("");

  const alreadyBooked = Boolean(existingBooking?.booked);

  const selectedDate = dateChoices[selectedDateIndex]?.date || null;
  const preferredTime = combineDateAndSlot(selectedDate, selectedSlot);

  const openChat = (bookingId, name = expertName) => {
    navigation.replace("ChatConsult", {
      bookingId,
      expertName: name,
    });
  };

  const handleConfirm = async () => {
    if (!Number.isFinite(expertId)) {
      setError("Invalid expert selected.");
      return;
    }

    setSaving(true);
    setError("");
    setConfirmedText("");

    try {
      if (alreadyBooked && existingBooking?.booking_id) {
        setConfirmedText("Booking already confirmed. Opening chat...");
        setTimeout(() => openChat(existingBooking.booking_id, expertName), 350);
        return;
      }

      let bookingId = Number(existingBooking?.booking_id);
      if (!Number.isFinite(bookingId)) {
        const created = await createConsultationBooking({
          expertId,
          topic: topic.trim(),
          preferredTime,
          initialMessage: initialMessage.trim(),
        });
        bookingId = Number(created?.booking_id);
      }

      if (!Number.isFinite(bookingId)) {
        throw new Error("Unable to create booking.");
      }

      const result = await markConsultationBooked(bookingId);
      const booked = result?.booking;

      setConfirmedText("Booking confirmed and lead marked.");
      setTimeout(() => {
        openChat(Number(booked?.booking_id) || bookingId, booked?.expert?.display_name || expertName);
      }, 450);
    } catch (err) {
      setError(err?.message || "Failed to confirm booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: scale(16), paddingBottom: verticalScale(36) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Book Consultation</Text>
        <Text style={styles.subtitle}>Schedule and confirm your consultation lead.</Text>

        <View style={styles.expertPill}>
          <Text style={styles.expertPillText}>{expertName}</Text>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Calendar size={16} color="#93c5fd" />
            <Text style={styles.sectionTitle}>Date</Text>
          </View>
          <View style={styles.pillRow}>
            {dateChoices.map((item, index) => {
              const active = index === selectedDateIndex;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSelectedDateIndex(index)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color="#86efac" />
            <Text style={styles.sectionTitle}>Time</Text>
          </View>
          <View style={styles.pillRow}>
            {SLOT_OPTIONS.map((slot) => {
              const active = slot === selectedSlot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{slot}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Topic</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you want help with?"
            placeholderTextColor="#64748b"
            value={topic}
            onChangeText={setTopic}
            editable={!saving}
          />

          <Text style={[styles.sectionTitle, { marginTop: verticalScale(10) }]}>Initial Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Optional: send a first message to the expert"
            placeholderTextColor="#64748b"
            value={initialMessage}
            onChangeText={setInitialMessage}
            editable={!saving && !existingBooking?.booking_id}
            multiline
          />
          {!!existingBooking?.booking_id && (
            <Text style={styles.hint}>
              Existing booking found: confirm booking now, then continue chat in thread.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, saving && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#dcfce7" />
          ) : (
            <Text style={styles.confirmText}>{alreadyBooked ? "Open Chat" : "Confirm Booking"}</Text>
          )}
        </TouchableOpacity>

        {!!confirmedText && (
          <View style={styles.confirmedRow}>
            <CheckCircle2 size={16} color="#22c55e" />
            <Text style={styles.confirmedText}>{confirmedText}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  container: { flex: 1 },
  header: {
    fontSize: moderateScale(24),
    fontWeight: "900",
    color: "#f8fafc",
  },
  subtitle: {
    marginTop: verticalScale(4),
    marginBottom: verticalScale(10),
    color: "#94a3b8",
    fontSize: moderateScale(12),
  },
  expertPill: {
    alignSelf: "flex-start",
    backgroundColor: "#172554",
    borderColor: "#1d4ed8",
    borderWidth: 1,
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(12),
  },
  expertPillText: {
    color: "#bfdbfe",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  error: {
    color: "#fca5a5",
    marginBottom: verticalScale(10),
    fontSize: moderateScale(12),
  },
  sectionCard: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: scale(14),
    padding: scale(12),
    marginBottom: verticalScale(12),
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  sectionTitle: {
    color: "#e2e8f0",
    fontSize: moderateScale(13),
    fontWeight: "700",
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
    borderRadius: scale(999),
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
  },
  pillActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#3b82f6",
  },
  pillText: { color: "#94a3b8", fontSize: moderateScale(12), fontWeight: "700" },
  pillTextActive: { color: "#dbeafe" },
  input: {
    marginTop: verticalScale(8),
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    color: "#f8fafc",
    borderRadius: scale(10),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(12),
  },
  messageInput: {
    minHeight: verticalScale(68),
    textAlignVertical: "top",
  },
  hint: {
    marginTop: verticalScale(6),
    color: "#64748b",
    fontSize: moderateScale(11),
  },
  confirmButton: {
    backgroundColor: "#166534",
    borderColor: "#16a34a",
    borderWidth: 1,
    borderRadius: scale(12),
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmText: {
    color: "#dcfce7",
    fontWeight: "800",
    fontSize: moderateScale(13),
  },
  confirmedRow: {
    marginTop: verticalScale(10),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  confirmedText: {
    color: "#86efac",
    fontSize: moderateScale(12),
  },
});
