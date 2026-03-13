import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Mail, KeyRound, Lock } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";
import { useAppTheme } from "../context/ThemeContext";

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
const hasStrongPassword = (value) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[^A-Za-z0-9]/.test(value);

export default function PasswordReset({ navigation }) {
  const { palette } = useAppTheme();
  const styles = useMemo(() => buildStyles(palette), [palette]);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const canSendCode = useMemo(() => isValidEmail(email), [email]);

  const handleSendCode = () => {
    if (!canSendCode) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleReset = () => {
    if (!code.trim()) {
      setError("Enter the verification code.");
      return;
    }
    if (!hasStrongPassword(password)) {
      setError("Password needs 8+ chars, 1 uppercase, 1 special.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? "We will send a verification code to your email."
            : "Enter the code and set a new password."}
        </Text>

        <View style={styles.inputGroup}>
          <Mail size={18} color={palette.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={palette.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {step === 2 && (
          <>
            <View style={styles.inputGroup}>
              <KeyRound size={18} color={palette.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Verification code"
                placeholderTextColor={palette.textMuted}
                value={code}
                onChangeText={setCode}
              />
            </View>
            <View style={styles.inputGroup}>
              <Lock size={18} color={palette.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor={palette.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <View style={styles.inputGroup}>
              <Lock size={18} color={palette.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={palette.textMuted}
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>
          </>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {step === 1 ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleSendCode}>
            <Text style={styles.primaryText}>Send Code</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleReset}>
            <Text style={styles.primaryText}>Reset Password</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function buildStyles(palette) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  container: {
    flex: 1,
    padding: scale(20),
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: palette.textMuted,
    marginBottom: verticalScale(20),
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: 14,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: palette.cardBorder,
    marginBottom: verticalScale(12),
  },
  input: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: moderateScale(14),
    color: palette.textPrimary,
  },
  error: {
    color: palette.danger,
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(14) },
  backLink: { marginTop: verticalScale(16), alignItems: "center" },
  backText: { color: "#2563eb", fontSize: moderateScale(12), fontWeight: "600" },
  });
}
