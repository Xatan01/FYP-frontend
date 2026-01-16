import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

export default function Login({ navigation, onAuthChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => /\S+@\S+\.\S+/.test(email) && password.trim().length > 0,
    [email, password]
  );

  const handleLogin = () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }
    setError("");
    onAuthChange?.(true);
  };

  const handleGoogle = () => {
    setError("Google sign-in needs backend setup.");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue learning and trading.</Text>

        <View style={styles.inputGroup}>
          <Mail size={18} color="#64748b" />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputGroup}>
          <Lock size={18} color="#64748b" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.forgot}>
          <Text
            style={styles.forgotText}
            onPress={() => navigation.navigate("PasswordReset")}
          >
            Forgot password?
          </Text>
        </TouchableOpacity>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
          onPress={handleLogin}
          disabled={!canSubmit}
        >
          <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.primaryFill}>
            <Text style={styles.primaryText}>Sign In</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogle}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New here?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: {
    flex: 1,
    padding: scale(20),
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(26),
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: "#64748b",
    marginBottom: verticalScale(20),
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: verticalScale(12),
  },
  input: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: moderateScale(14),
    color: "#0f172a",
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(16),
  },
  forgotText: { color: "#2563eb", fontSize: moderateScale(12) },
  error: {
    color: "#dc2626",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryFill: {
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(14) },
  googleButton: {
    marginTop: verticalScale(10),
    borderRadius: 16,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  googleText: { color: "#0f172a", fontWeight: "600", fontSize: moderateScale(14) },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(18),
    gap: scale(6),
  },
  footerText: { color: "#64748b", fontSize: moderateScale(12) },
  footerLink: { color: "#2563eb", fontSize: moderateScale(12), fontWeight: "600" },
});
