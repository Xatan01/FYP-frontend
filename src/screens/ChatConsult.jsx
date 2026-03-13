import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Send, UserCircle2, RefreshCw } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import {
  fetchConsultationMessages,
  sendConsultationMessage,
} from "../api/consultation";
import { useAppTheme } from "../context/ThemeContext";

export default function ChatConsult({ route }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const bookingId = Number(route?.params?.bookingId);
  const expertName = route?.params?.expertName || "Advisor";

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef(null);

  const loadMessages = useCallback(
    async ({ silent = false } = {}) => {
      if (!Number.isFinite(bookingId)) {
        setLoading(false);
        setError("Missing booking id. Open chat from Consult page.");
        return;
      }

      if (!silent) setLoading(true);
      setRefreshing(silent);
      setError("");

      try {
        const res = await fetchConsultationMessages(bookingId);
        setMessages(Array.isArray(res?.items) ? res.items : []);
      } catch (err) {
        setError(err?.message || "Failed to load chat.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bookingId]
  );

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  const handleSend = async () => {
    const message = input.trim();
    if (!message || !Number.isFinite(bookingId) || sending) return;

    setSending(true);
    setError("");
    try {
      const created = await sendConsultationMessage(bookingId, message);
      setMessages((prev) => [...prev, created]);
      setInput("");
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd?.({ animated: true });
      });
    } catch (err) {
      setError(err?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <UserCircle2 size={24} color="#93c5fd" />
          <View>
            <Text style={styles.name}>{expertName}</Text>
            <Text style={styles.status}>Booking #{Number.isFinite(bookingId) ? bookingId : "--"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadMessages({ silent: true })}
          disabled={refreshing || loading}
        >
          <RefreshCw size={14} color="#bfdbfe" />
          <Text style={styles.refreshText}>{refreshing ? "..." : "Refresh"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      ) : (
        <>
          {!!error && <Text style={styles.error}>{error}</Text>}

          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={{ padding: scale(14), gap: verticalScale(8) }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd?.({ animated: true })}
          >
            {messages.map((msg) => {
              const fromUser = String(msg?.sender || "").toLowerCase() === "user";
              const fromSystem = String(msg?.sender || "").toLowerCase() === "system";
              return (
                <View
                  key={msg.message_id}
                  style={[
                    styles.bubble,
                    fromUser ? styles.bubbleUser : fromSystem ? styles.bubbleSystem : styles.bubbleAdvisor,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      fromUser ? styles.bubbleTextUser : fromSystem ? styles.bubbleTextSystem : styles.bubbleTextAdvisor,
                    ]}
                  >
                    {msg.message}
                  </Text>
                </View>
              );
            })}

            {!messages.length && <Text style={styles.emptyText}>No messages yet. Start the conversation.</Text>}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              placeholderTextColor={palette.textMuted}
              value={input}
              onChangeText={setInput}
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#dbeafe" />
              ) : (
                <Send size={18} color="#dbeafe" />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(12),
      borderBottomWidth: 1,
      borderBottomColor: palette.cardBorder,
      backgroundColor: palette.card,
    },
    identity: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    name: { fontSize: moderateScale(15), fontWeight: "800", color: palette.textPrimary },
    status: { fontSize: moderateScale(11), color: "#86efac" },
    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
      borderWidth: 1,
      borderColor: palette.accent,
      backgroundColor: palette.accentSoft,
      borderRadius: scale(999),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(4),
    },
    refreshText: {
      color: palette.accentText,
      fontSize: moderateScale(11),
      fontWeight: "700",
    },
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
    error: {
      marginHorizontal: scale(14),
      marginTop: verticalScale(8),
      color: palette.danger,
      fontSize: moderateScale(12),
    },
    messages: {
      flex: 1,
    },
    bubble: {
      maxWidth: "82%",
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
      borderRadius: scale(12),
      borderWidth: 1,
    },
    bubbleAdvisor: {
      alignSelf: "flex-start",
      backgroundColor: palette.card,
      borderColor: palette.inputBorder,
    },
    bubbleUser: {
      alignSelf: "flex-end",
      backgroundColor: palette.accentSoft,
      borderColor: "#3b82f6",
    },
    bubbleSystem: {
      alignSelf: "center",
      backgroundColor: "#052e16",
      borderColor: "#166534",
    },
    bubbleText: { fontSize: moderateScale(12) },
    bubbleTextAdvisor: { color: palette.textPrimary },
    bubbleTextUser: { color: palette.accentText },
    bubbleTextSystem: { color: "#86efac", fontWeight: "700" },
    emptyText: {
      textAlign: "center",
      color: palette.textMuted,
      fontSize: moderateScale(12),
      marginTop: verticalScale(12),
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      padding: scale(12),
      borderTopWidth: 1,
      borderTopColor: palette.cardBorder,
      backgroundColor: palette.card,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: palette.inputBorder,
      backgroundColor: palette.input,
      borderRadius: scale(999),
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(8),
      color: palette.textPrimary,
      fontSize: moderateScale(12),
    },
    sendButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.accent,
      borderWidth: 1,
      borderColor: palette.accent,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
}
