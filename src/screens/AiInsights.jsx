import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Bot,
  Compass,
  Send,
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
import { useAppTheme } from "../context/ThemeContext";

const TAB_ROUTES = new Set(["Home", "Learn", "VirtualMarket", "Consult", "Profile"]);

function MessageBubble({ message, onActionPress, palette, styles }) {
  const fromUser = message.role === "user";
  const action = message.action;

  return (
    <View style={[styles.messageRow, fromUser ? styles.messageRowUser : styles.messageRowBot]}>
      {!fromUser ? (
        <View style={[styles.avatar, styles.avatarBot]}>
          <Bot size={16} color={palette.accentText} />
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
            <ArrowRight size={14} color={palette.textPrimary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {fromUser ? (
        <View style={[styles.avatar, styles.avatarUser]}>
          <User size={16} color={palette.accentText} />
        </View>
      ) : null}
    </View>
  );
}

export default function AiInsights({ navigation }) {
  const { palette, isLight } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette, isLight), [palette, isLight]);
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
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? verticalScale(8) : 0}
      >
        <View style={styles.chatShell}>
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient colors={[palette.heroStart, palette.heroEnd]} style={styles.hero}>
              <Text style={[styles.heroTitle, isLight && styles.heroTitleLight]}>
                Ask anything about learning to trade.
              </Text>
              <Text style={[styles.heroSubtitle, isLight && styles.heroSubtitleLight]}>
                FinBot can explain core concepts, suggest the next feature to open, and point users to practice tools inside this app.
              </Text>

              <TouchableOpacity style={styles.heroActionCard} onPress={() => handleActionPress("Learn")}>
                <View style={styles.heroActionIcon}>
                  <Compass size={18} color={palette.accentText} />
                </View>
                <View style={styles.heroActionCopy}>
                  <Text style={[styles.heroActionTitle, isLight && styles.heroActionTitleLight]}>
                    Learning Path
                  </Text>
                  <Text style={styles.heroActionText}>
                    Start with structured lessons, then move into guided practice.
                  </Text>
                </View>
                <ArrowRight size={18} color={isLight ? palette.accent : palette.white} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.topSection}>
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
                keyboardShouldPersistTaps="handled"
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
            </View>

            <View style={styles.messageThread}>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onActionPress={handleActionPress}
                  palette={palette}
                  styles={styles}
                />
              ))}

              {isTyping ? (
                <View style={[styles.messageRow, styles.messageRowBot]}>
                  <View style={[styles.avatar, styles.avatarBot]}>
                    <Bot size={16} color={palette.accentText} />
                  </View>
                  <View style={[styles.messageBubble, styles.messageBubbleBot, styles.typingBubble]}>
                    <ActivityIndicator size="small" color={palette.accent} />
                    <Text style={styles.typingText}>FinBot is thinking...</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Ask about candlesticks, risk, practice trading, news, or next steps"
              placeholderTextColor={palette.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!isTyping}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || isTyping) && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isTyping}
            >
              <Send size={18} color={isLight ? palette.white : palette.accentText} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function buildStyles(palette, isLight) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: palette.background,
    },
    hero: {
      paddingHorizontal: scale(18),
      paddingTop: verticalScale(18),
      paddingBottom: verticalScale(22),
    },
    heroTitle: {
      color: palette.white,
      fontSize: moderateScale(26),
      fontWeight: "900",
      lineHeight: moderateScale(31),
    },
    heroTitleLight: {
      color: palette.textPrimary,
    },
    heroSubtitle: {
      marginTop: verticalScale(8),
      color: palette.textSecondary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },
    heroSubtitleLight: {
      color: palette.textSecondary,
    },
    heroActionCard: {
      flexDirection: "row",
      marginTop: verticalScale(16),
      backgroundColor: palette.overlay,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(18),
      padding: scale(12),
      alignItems: "center",
      gap: scale(12),
    },
    heroActionIcon: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.accent,
    },
    heroActionCopy: {
      flex: 1,
    },
    heroActionTitle: {
      color: palette.white,
      fontSize: moderateScale(14),
      fontWeight: "800",
    },
    heroActionTitleLight: {
      color: palette.textPrimary,
    },
    heroActionText: {
      color: palette.textMuted,
      fontSize: moderateScale(12),
      marginTop: verticalScale(2),
      lineHeight: moderateScale(17),
    },
    chatShell: {
      flex: 1,
      backgroundColor: palette.background,
    },
    topSection: {
      marginTop: -verticalScale(10),
      backgroundColor: palette.background,
      borderTopLeftRadius: scale(26),
      borderTopRightRadius: scale(26),
      paddingTop: verticalScale(18),
    },
    sectionTitle: {
      paddingHorizontal: scale(18),
      fontSize: moderateScale(14),
      fontWeight: "800",
      color: palette.textPrimary,
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
      borderColor: palette.inputBorder,
      backgroundColor: palette.card,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(7),
    },
    modelChipActive: {
      backgroundColor: palette.accentSoft,
      borderColor: palette.accent,
    },
    modelChipText: {
      color: palette.textMuted,
      fontSize: moderateScale(11),
      fontWeight: "700",
    },
    modelChipTextActive: {
      color: palette.accentSoftText,
    },
    promptRow: {
      paddingHorizontal: scale(18),
      paddingTop: verticalScale(12),
      paddingBottom: verticalScale(8),
      gap: scale(10),
    },
    promptChip: {
      maxWidth: scale(240),
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderRadius: scale(18),
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(10),
    },
    promptChipText: {
      color: palette.accentSoftText,
      fontSize: moderateScale(12),
      fontWeight: "600",
    },
    messagesContent: {
      paddingBottom: verticalScale(14),
    },
    messages: {
      flex: 1,
    },
    messageThread: {
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
      backgroundColor: palette.accent,
    },
    avatarUser: {
      backgroundColor: isLight ? palette.textSecondary : palette.cardMuted,
    },
    messageBubble: {
      maxWidth: "82%",
      borderRadius: scale(18),
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(11),
    },
    messageBubbleBot: {
      backgroundColor: palette.accentSoft,
      borderWidth: 1,
      borderColor: palette.accent,
      borderBottomLeftRadius: scale(6),
    },
    messageBubbleUser: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      borderBottomRightRadius: scale(6),
    },
    messageText: {
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },
    messageTextBot: {
      color: isLight ? palette.textPrimary : palette.accentText,
    },
    messageTextUser: {
      color: palette.textPrimary,
    },
    inlineAction: {
      marginTop: verticalScale(10),
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      backgroundColor: palette.cardMuted,
      borderRadius: scale(999),
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(7),
    },
    inlineActionText: {
      color: palette.textPrimary,
      fontSize: moderateScale(11),
      fontWeight: "800",
    },
    typingBubble: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },
    typingText: {
      color: palette.textMuted,
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
      borderTopColor: palette.cardBorder,
      backgroundColor: palette.card,
    },
    input: {
      flex: 1,
      minHeight: verticalScale(50),
      maxHeight: verticalScale(110),
      backgroundColor: palette.input,
      borderWidth: 1,
      borderColor: palette.inputBorder,
      borderRadius: scale(18),
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(12),
      color: palette.textPrimary,
      fontSize: moderateScale(13),
    },
    sendButton: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(16),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.accent,
    },
    sendButtonDisabled: {
      backgroundColor: palette.tabInactive,
    },
  });
}
