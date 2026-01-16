import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Send, UserCircle2 } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

const messages = [
  { id: "m1", from: "advisor", text: "Hi Divya, how can I help today?" },
  { id: "m2", from: "user", text: "Can we review my REIT allocation?" },
  { id: "m3", from: "advisor", text: "Sure. I will pull up your holdings." },
];

export default function ChatConsult() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <UserCircle2 size={24} color="#2563eb" />
        <View>
          <Text style={styles.name}>Sarah Lee</Text>
          <Text style={styles.status}>Online</Text>
        </View>
      </View>

      <View style={styles.messages}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.from === "user" ? styles.bubbleUser : styles.bubbleAdvisor,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                msg.from === "user" ? styles.bubbleTextUser : styles.bubbleTextAdvisor,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.sendButton}>
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  name: { fontSize: moderateScale(16), fontWeight: "700", color: "#0f172a" },
  status: { fontSize: moderateScale(12), color: "#16a34a" },
  messages: {
    flex: 1,
    padding: scale(16),
    gap: verticalScale(10),
  },
  bubble: {
    maxWidth: "80%",
    padding: scale(12),
    borderRadius: 16,
  },
  bubbleAdvisor: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
  },
  bubbleText: { fontSize: moderateScale(13) },
  bubbleTextAdvisor: { color: "#0f172a" },
  bubbleTextUser: { color: "#fff" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(12),
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(13),
    color: "#0f172a",
    marginRight: scale(10),
  },
  sendButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
});
