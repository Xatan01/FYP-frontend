import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Bot,
  Brain,
  Compass,
  Send,
  Sparkles,
  User,
} from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import {
  BOT_PROMPTS,
  BOT_ROUTE_LABELS,
  createAssistantReply,
  createBackendReply,
  createWelcomeMessage,
  buildFinbotPrompt,
} from "../lib/finbot";
import { generateInference } from "../api/inference";

const TAB_ROUTES = new Set(["Home", "Learn", "VirtualMarket", "Consult", "Profile"]);

function MessageBubble({ message, onActionPress }) {
  const fromUser = message.role === "user";
  const action = message.action;

  return (
    <View style={[styles.messageRow, fromUser ? styles.messageRowUser : styles.messageRowBot]}>
      {!fromUser ? (
        <View style={[styles.avatar, styles.avatarBot]}>
          <Bot size={16} color="#f8fafc" />
        </View>
      ) : null}

      <View style={[styles.messageBubble, fromUser ? styles.messageBubbleUser : styles.messageBubbleBot]}>
        <Text style={[styles.messageText, fromUser ? styles.messageTextUser : styles.messageTextBot]}>
          {message.text}
        </Text>

        {action ? (
          <TouchableOpacity style={styles.inlineAction} onPress={() => onActionPress(action.route)}>
            <Text style={styles.inlineActionText}>
              Open {action.label || BOT_ROUTE_LABELS[action.route] || action.route}
            </Text>
            <ArrowRight size={14} color="#0f172a" />
          </TouchableOpacity>
        ) : null}
      </View>

      {fromUser ? (
        <View style={[styles.avatar, styles.avatarUser]}>
          <User size={16} color="#eff6ff" />
        </View>
      ) : null}
    </View>
  );
}

export default function AiInsights({ navigation }) {
  const scrollRef = useRef(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [createWelcomeMessage()]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeModel, setActiveModel] = useState("finetuned");

  useEffect(() => {
    scrollRef.current?.scrollToEnd?.({ animated: true });
  }, [messages, isTyping]);

  const handleActionPress = (route) => {
    if (!route) return;
    if (TAB_ROUTES.has(route)) {
      navigation.navigate("MainTabs", { screen: route });
      return;
    }
    navigation.navigate(route);
  };

  const handleSend = async (submittedText) => {
    const text = String(submittedText ?? input).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const result = await generateInference(buildFinbotPrompt(text), activeModel);
        const answer = String(result?.response || "").trim();
        if (!answer) {
          throw new Error("Empty model response.");
        }
        setMessages((prev) => [...prev, createBackendReply(answer, text)]);
      } catch (error) {
        const fallback = createAssistantReply(text);
        const fallbackText = `${fallback.text}\n\nLive AI is unavailable right now, so this answer is coming from the app's built-in coaching fallback.`;
        setMessages((prev) => [
          ...prev,
          {
            ...fallback,
            text: fallbackText,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }, 650);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#0f172a", "#111827", "#1e293b"]} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <Sparkles size={14} color="#fde68a" />
            <Text style={styles.heroBadgeText}>FinBot Coach</Text>
          </View>
          <TouchableOpacity style={styles.heroCta} onPress={() => handleActionPress("Learn")}>
            <Compass size={15} color="#082f49" />
            <Text style={styles.heroCtaText}>Learning Path</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heroTitle}>Ask anything about learning to trade.</Text>
        <Text style={styles.heroSubtitle}>
          FinBot can explain core concepts, suggest the next feature to open, and point users to practice tools inside this app.
        </Text>

        <View style={styles.heroStats}>
          <View style={styles.heroStatCard}>
            <Brain size={16} color="#38bdf8" />
            <Text style={styles.heroStatValue}>Education first</Text>
            <Text style={styles.heroStatLabel}>Beginner-friendly answers</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Sparkles size={16} color="#f59e0b" />
            <Text style={styles.heroStatValue}>Actionable</Text>
            <Text style={styles.heroStatLabel}>Routes into app features</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.chatShell}>
        <Text style={styles.sectionTitle}>Suggested prompts</Text>
        <View style={styles.modelSwitchRow}>
          {[
            { key: "finetuned", label: "Finetuned" },
            { key: "gemma", label: "Gemma" },
          ].map((modelOption) => {
            const active = activeModel === modelOption.key;
            return (
              <TouchableOpacity
                key={modelOption.key}
                style={[styles.modelChip, active && styles.modelChipActive]}
                onPress={() => setActiveModel(modelOption.key)}
              >
                <Text style={[styles.modelChipText, active && styles.modelChipTextActive]}>
                  {modelOption.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptRow}
        >
          {BOT_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.promptChip}
              onPress={() => handleSend(prompt)}
            >
              <Text style={styles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onActionPress={handleActionPress}
            />
          ))}

          {isTyping ? (
            <View style={[styles.messageRow, styles.messageRowBot]}>
              <View style={[styles.avatar, styles.avatarBot]}>
                <Bot size={16} color="#f8fafc" />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleBot, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.typingText}>FinBot is thinking...</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Ask about candlesticks, risk, practice trading, news, or next steps"
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
            multiline
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isTyping}
          >
            <Send size={18} color="#eff6ff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#e2e8f0",
  },
  hero: {
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(22),
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: scale(10),
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.22)",
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
  },
  heroBadgeText: {
    color: "#fef3c7",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#e0f2fe",
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
  },
  heroCtaText: {
    color: "#082f49",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  heroTitle: {
    marginTop: verticalScale(16),
    color: "#f8fafc",
    fontSize: moderateScale(26),
    fontWeight: "900",
    lineHeight: moderateScale(31),
  },
  heroSubtitle: {
    marginTop: verticalScale(8),
    color: "#cbd5e1",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },
  heroStats: {
    flexDirection: "row",
    gap: scale(12),
    marginTop: verticalScale(16),
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    borderRadius: scale(18),
    padding: scale(12),
    gap: verticalScale(5),
  },
  heroStatValue: {
    color: "#f8fafc",
    fontSize: moderateScale(13),
    fontWeight: "800",
  },
  heroStatLabel: {
    color: "#94a3b8",
    fontSize: moderateScale(11),
  },
  chatShell: {
    flex: 1,
    marginTop: -verticalScale(10),
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: scale(26),
    borderTopRightRadius: scale(26),
    paddingTop: verticalScale(18),
  },
  sectionTitle: {
    paddingHorizontal: scale(18),
    fontSize: moderateScale(14),
    fontWeight: "800",
    color: "#0f172a",
  },
  modelSwitchRow: {
    flexDirection: "row",
    gap: scale(8),
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(10),
  },
  modelChip: {
    borderRadius: scale(999),
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
  },
  modelChipActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#60a5fa",
  },
  modelChipText: {
    color: "#475569",
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  modelChipTextActive: {
    color: "#1d4ed8",
  },
  promptRow: {
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
    gap: scale(10),
  },
  promptChip: {
    maxWidth: scale(240),
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: scale(18),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
  },
  promptChipText: {
    color: "#1e3a8a",
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(14),
    gap: verticalScale(12),
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: scale(8),
  },
  messageRowBot: {
    justifyContent: "flex-start",
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBot: {
    backgroundColor: "#1d4ed8",
  },
  avatarUser: {
    backgroundColor: "#0f172a",
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: scale(18),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(11),
  },
  messageBubbleBot: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderBottomLeftRadius: scale(6),
  },
  messageBubbleUser: {
    backgroundColor: "#1d4ed8",
    borderBottomRightRadius: scale(6),
  },
  messageText: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },
  messageTextBot: {
    color: "#1e293b",
  },
  messageTextUser: {
    color: "#eff6ff",
  },
  inlineAction: {
    marginTop: verticalScale(10),
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#dbeafe",
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(7),
  },
  inlineActionText: {
    color: "#0f172a",
    fontSize: moderateScale(11),
    fontWeight: "800",
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  typingText: {
    color: "#475569",
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: scale(10),
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(18),
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    minHeight: verticalScale(50),
    maxHeight: verticalScale(110),
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: scale(18),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    color: "#0f172a",
    fontSize: moderateScale(13),
  },
  sendButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d4ed8",
  },
  sendButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
});
