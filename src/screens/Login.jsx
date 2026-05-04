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
import { useAuth } from "../context/AuthContext";

export default function Login({ navigation, route }) {
  const initialEmail = route?.params?.email ?? "";
  const successMessage = route?.params?.successMessage ?? "";
  const{login} = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => /\S+@\S+\.\S+/.test(email) && password.trim().length > 0,
    [email, password]
  );

  const handleLogin = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      // AuthContext will update session
      // RootNavigator will switch stacks automatically
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleGoogle = () => {
    setError("Google sign-in needs backend setup.");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.brandWrap}>
            <LinearGradient colors={["#1d4ed8", "#38bdf8"]} style={styles.logoBubble}>
              <View style={styles.logoCore}>
                <View style={styles.logoBarRow}>
                  <View style={[styles.logoBar, styles.logoBarShort]} />
                  <View style={[styles.logoBar, styles.logoBarMid]} />
                  <View style={[styles.logoBar, styles.logoBarTall]} />
                </View>
                <View style={styles.logoSparkLine} />
                <View style={styles.logoSparkDot} />
              </View>
            </LinearGradient>
            <Text style={styles.title}>StockED</Text>
            <Text style={styles.subtitle}>Sign in to continue learning and trading.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Mail size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputGroup}>
            <Lock size={18} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
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

          {!!successMessage && <Text style={styles.success}>{successMessage}</Text>}
          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={!canSubmit || isSubmitting}
          >
            <LinearGradient colors={["#2563eb", "#1d4ed8"]} style={styles.primaryFill}>
              <Text style={styles.primaryText}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  container: {
    flex: 1,
    padding: scale(20),
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 20,
    padding: scale(16),
  },
  brandWrap: {
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  logoBubble: {
    width: scale(78),
    height: scale(78),
    borderRadius: scale(39),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
    shadowColor: "#38bdf8",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoCore: {
    position: "relative",
    width: scale(42),
    height: scale(42),
    alignItems: "center",
    justifyContent: "center",
  },
  logoBarRow: {
    position: "absolute",
    bottom: scale(6),
    left: scale(2),
    right: scale(8),
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  logoBar: {
    width: scale(8),
    borderRadius: 999,
    backgroundColor: "#eff6ff",
  },
  logoBarShort: {
    height: scale(12),
    opacity: 0.9,
  },
  logoBarMid: {
    height: scale(18),
  },
  logoBarTall: {
    height: scale(26),
  },
  logoSparkLine: {
    position: "absolute",
    width: scale(28),
    height: scale(4),
    borderRadius: 999,
    backgroundColor: "#fef08a",
    top: scale(13),
    left: scale(10),
    transform: [{ rotate: "-28deg" }],
  },
  logoSparkDot: {
    position: "absolute",
    width: scale(8),
    height: scale(8),
    borderRadius: 999,
    backgroundColor: "#fef08a",
    top: scale(6),
    right: scale(5),
    borderWidth: 2,
    borderColor: "#dbeafe",
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "800",
    color: "#e2e8f0",
    marginBottom: verticalScale(6),
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: "#94a3b8",
    textAlign: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: verticalScale(12),
  },
  input: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: moderateScale(14),
    color: "#e2e8f0",
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(16),
  },
  forgotText: { color: "#93c5fd", fontSize: moderateScale(12) },
  error: {
    color: "#fca5a5",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  success: {
    color: "#86efac",
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
    borderColor: "#334155",
    backgroundColor: "#111827",
  },
  googleText: { color: "#e2e8f0", fontWeight: "600", fontSize: moderateScale(14) },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(18),
    gap: scale(6),
  },
  footerText: { color: "#94a3b8", fontSize: moderateScale(12) },
  footerLink: { color: "#93c5fd", fontSize: moderateScale(12), fontWeight: "600" },
});
