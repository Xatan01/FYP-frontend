import React, { useCallback, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { MessageCircle, CalendarCheck2, Star } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import {
  createConsultationBooking,
  fetchConsultationBookings,
  fetchConsultationExperts,
} from "../api/consultation";
import { useAppTheme } from "../context/ThemeContext";
import LoadingState from "../components/LoadingState";

function toMoney(amount, currency = "USD") {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return `${currency} --`;
  return `${currency} ${numeric.toFixed(0)}/hr`;
}

function initialsFromName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "EX";
  return `${parts[0][0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
}

export default function Consult({ navigation }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const [experts, setExperts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeExpertId, setActiveExpertId] = useState(null);

  const latestBookingByExpert = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const expertId = Number(booking?.expert?.expert_id);
      if (!Number.isFinite(expertId)) return;
      if (!map.has(expertId)) {
        map.set(expertId, booking);
      }
    });
    return map;
  }, [bookings]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [expertsRes, bookingsRes] = await Promise.all([
        fetchConsultationExperts(),
        fetchConsultationBookings(),
      ]);
      setExperts(Array.isArray(expertsRes?.items) ? expertsRes.items : []);
      setBookings(Array.isArray(bookingsRes?.items) ? bookingsRes.items : []);
    } catch (err) {
      setError(err?.message || "Failed to load consultation experts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleOpenChat = async (expert) => {
    const expertId = Number(expert?.expert_id);
    if (!Number.isFinite(expertId)) return;

    setActiveExpertId(expertId);
    setError("");

    try {
      let booking = latestBookingByExpert.get(expertId);
      if (!booking) {
        booking = await createConsultationBooking({
          expertId,
          topic: "",
          preferredTime: null,
          initialMessage: "",
        });
        setBookings((prev) => [booking, ...prev]);
      }

      navigation.navigate("ChatConsult", {
        bookingId: booking.booking_id,
        expertName: booking?.expert?.display_name || expert.display_name,
      });
    } catch (err) {
      setError(err?.message || "Unable to open chat.");
    } finally {
      setActiveExpertId(null);
    }
  };

  const handleOpenBooking = (expert) => {
    const expertId = Number(expert?.expert_id);
    if (!Number.isFinite(expertId)) return;

    const booking = latestBookingByExpert.get(expertId) || null;
    navigation.navigate("ConsultationBooking", {
      expert,
      booking,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <LoadingState
          variant="screen"
          title="Loading consultants"
          message="Fetching available experts, bookings, and chat access."
        />
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: scale(16), paddingBottom: verticalScale(36) }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Consult Experts</Text>
          <Text style={styles.subheader}>Chat or book directly with DB-backed advisors.</Text>

          {!!error && <Text style={styles.error}>{error}</Text>}

          {experts.map((expert) => {
            const booking = latestBookingByExpert.get(Number(expert.expert_id));
            const booked = Boolean(booking?.booked);
            const busy = activeExpertId === expert.expert_id;

            return (
              <View key={expert.expert_id} style={styles.card}>
                <View style={styles.topRow}>
                  {expert.avatar_url ? (
                    <Image source={{ uri: expert.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackText}>
                        {initialsFromName(expert.display_name)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.profileCopy}>
                    <Text style={styles.name}>{expert.display_name}</Text>
                    <Text style={styles.designation}>{expert.designation}</Text>
                    <Text style={styles.specialty}>{expert.specialty}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.ratingPill}>
                        <Star size={12} color="#facc15" fill="#facc15" />
                        <Text style={styles.ratingText}>{Number(expert.rating || 0).toFixed(1)}</Text>
                      </View>
                      <Text style={styles.metaText}>{expert.years_experience} yrs</Text>
                      <Text style={styles.metaText}>{toMoney(expert.hourly_rate, expert.currency)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.chatButton, busy && styles.buttonDisabled]}
                    onPress={() => handleOpenChat(expert)}
                    disabled={busy}
                  >
                    <MessageCircle size={15} color={palette.accentSoftText} />
                    <Text style={styles.chatText}>{busy ? "Opening..." : "Chat"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.bookButton, busy && styles.buttonDisabled]}
                    onPress={() => handleOpenBooking(expert)}
                    disabled={busy}
                  >
                    <CalendarCheck2 size={15} color={palette.successSoftText} />
                    <Text style={styles.bookText}>{booked ? "Booked" : "Book"}</Text>
                  </TouchableOpacity>
                </View>

                {booked ? (
                  <View style={styles.badgeRow}>
                    <Text style={[styles.statusBadge, styles.bookedBadge]}>Booked Lead</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {!experts.length && <Text style={styles.empty}>No experts found. Seed experts in DB first.</Text>}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: { flex: 1 },
    loadingWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
    },
    loadingText: {
      color: palette.textMuted,
      fontSize: moderateScale(12),
    },
    header: {
      fontSize: moderateScale(24),
      fontWeight: "900",
      color: palette.textPrimary,
    },
    subheader: {
      marginTop: verticalScale(4),
      marginBottom: verticalScale(14),
      color: palette.textMuted,
      fontSize: moderateScale(12),
    },
    error: {
      color: palette.danger,
      marginBottom: verticalScale(10),
      fontSize: moderateScale(12),
    },
    card: {
      backgroundColor: palette.card,
      borderColor: palette.cardBorder,
      borderWidth: 1,
      borderRadius: scale(16),
      padding: scale(14),
      marginBottom: verticalScale(12),
    },
    topRow: {
      flexDirection: "row",
      gap: scale(10),
    },
    avatar: {
      width: scale(54),
      height: scale(54),
      borderRadius: scale(27),
    },
    avatarFallback: {
      width: scale(54),
      height: scale(54),
      borderRadius: scale(27),
      backgroundColor: palette.accentSoft,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: palette.accent,
    },
    avatarFallbackText: {
      color: palette.accentSoftText,
      fontSize: moderateScale(14),
      fontWeight: "800",
    },
    profileCopy: {
      flex: 1,
    },
    name: {
      color: palette.textPrimary,
      fontSize: moderateScale(15),
      fontWeight: "800",
    },
    designation: {
      color: palette.textSecondary,
      fontSize: moderateScale(12),
      marginTop: verticalScale(2),
    },
    specialty: {
      color: palette.tabActive,
      fontSize: moderateScale(12),
      marginTop: verticalScale(2),
      fontWeight: "600",
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: scale(8),
      marginTop: verticalScale(6),
    },
    ratingPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: palette.cardSoft,
      borderColor: palette.inputBorder,
      borderWidth: 1,
      borderRadius: scale(999),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(3),
    },
    ratingText: {
      color: palette.warningSoftText,
      fontSize: moderateScale(11),
      fontWeight: "700",
    },
    metaText: {
      color: palette.textMuted,
      fontSize: moderateScale(11),
    },
    actionRow: {
      flexDirection: "row",
      gap: scale(8),
      marginTop: verticalScale(10),
    },
    chatButton: {
      flex: 1,
      backgroundColor: palette.accentSoft,
      borderColor: palette.accent,
      borderWidth: 1,
      borderRadius: scale(10),
      paddingVertical: verticalScale(8),
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: scale(6),
    },
    chatText: {
      color: palette.accentSoftText,
      fontWeight: "700",
      fontSize: moderateScale(12),
    },
    bookButton: {
      flex: 1,
      backgroundColor: palette.successSoft,
      borderColor: palette.success,
      borderWidth: 1,
      borderRadius: scale(10),
      paddingVertical: verticalScale(8),
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: scale(6),
    },
    bookText: {
      color: palette.successSoftText,
      fontWeight: "700",
      fontSize: moderateScale(12),
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    badgeRow: {
      marginTop: verticalScale(8),
      alignItems: "flex-start",
    },
    statusBadge: {
      fontSize: moderateScale(11),
      fontWeight: "700",
      borderRadius: scale(999),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(3),
      overflow: "hidden",
    },
    bookedBadge: {
      color: palette.successSoftText,
      backgroundColor: palette.successSoft,
    },
    empty: {
      marginTop: verticalScale(10),
      textAlign: "center",
      color: palette.textMuted,
      fontSize: moderateScale(12),
    },
  });
}
