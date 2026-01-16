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
import { User, Mail, Lock } from "lucide-react-native";
import { scale, verticalScale, moderateScale } from "../styles/responsive";

export default function Register({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const existingUsers = ["alex", "divya", "xavier"];
  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordStrong =
    password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);

  const canSubmit = useMemo(
    () =>
      name.trim().length > 0 &&
      isEmailValid &&
      isPasswordStrong &&
      confirm === password,
    [name, isEmailValid, isPasswordStrong, confirm, password]
  );

  const handleRegister = () => {
    if (!name.trim()) {
      setError("Username is required.");
      return;
    }
    if (existingUsers.includes(name.trim().toLowerCase())) {
      setError("Username is already taken.");
      return;
    }
    if (!isEmailValid) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isPasswordStrong) {
      setError("Password needs 8+ chars, 1 uppercase, 1 special.");
      return;
    }
    if (confirm !== password) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    navigation.replace("MainTabs");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start building your investing streak.</Text>

        <View style={styles.inputGroup}>
          <User size={18} color="#64748b" />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
        </View>
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
        <View style={styles.inputGroup}>
          <Lock size={18} color="#64748b" />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
          onPress={handleRegister}
          disabled={!canSubmit}
        >
          <LinearGradient colors={["#16a34a", "#15803d"]} style={styles.primaryFill}>
            <Text style={styles.primaryText}>Register</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>Sign in</Text>
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
  error: {
    color: "#dc2626",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: verticalScale(6),
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryFill: {
    paddingVertical: verticalScale(12),
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: moderateScale(14) },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(18),
    gap: scale(6),
  },
  footerText: { color: "#64748b", fontSize: moderateScale(12) },
  footerLink: { color: "#2563eb", fontSize: moderateScale(12), fontWeight: "600" },
});
