import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";

const { width } = Dimensions.get("window");
const CARD_W = Math.min(342, width - 48);

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async () => {
    if (!identifier || !password) {
      Alert.alert("Bitte fülle alle Felder aus.");
      return;
    }
    const res = await login(identifier, password);
    if (!res.ok) Alert.alert("Fehler", res.error);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <LinearGradient colors={["#1E40AF", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        <ScrollView bounces={false} contentContainerStyle={styles.scroll}>

          <View style={styles.brandWrap}>
            <View style={styles.brandIcon}>
              <Ionicons name="map-outline" size={28} color="#fff" />
            </View>
            <Text style={styles.brandTitle}>SmartCity</Text>
            <Text style={styles.brandSub}>Explore. Discover. Experience.</Text>
          </View>


          <View style={[styles.card, { width: CARD_W }]}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSub}>Sign in to continue your journey</Text>

            {/* Email / Username */}
            <View style={styles.inputWrap}>
              <View style={styles.leftIcon}>
                <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
              </View>
              <TextInput
                placeholder="Email or Username"
                placeholderTextColor="#ADAEBC"
                style={styles.input}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>


            <View style={styles.inputWrap}>
              <View style={styles.leftIcon}>
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
              </View>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#ADAEBC"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity style={styles.rightIcon} onPress={() => setShowPw((s) => !s)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Forgot */}
            <TouchableOpacity onPress={() => Alert.alert("Coming soon", "Password reset kommt später 🙂")}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit}>
              <Text style={styles.primaryText}>Sign In</Text>
            </TouchableOpacity>


            <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 14 }}>
              <Text style={styles.linkText}>
                No account yet? <Text style={styles.linkStrong}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { alignItems: "center", paddingTop: 80, paddingBottom: 40 },
  brandWrap: { alignItems: "center", marginBottom: 24 },
  brandIcon: {
    width: 54, height: 48, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  brandTitle: { color: "#fff", fontSize: 36, fontWeight: "700", letterSpacing: 0.9, marginTop: 14 },
  brandSub: { color: "rgba(255,255,255,0.8)", fontSize: 18, marginTop: 4 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24, paddingTop: 28,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  cardTitle: { fontSize: 24, fontWeight: "700", color: "#1F2937", textAlign: "center" },
  cardSub: { fontSize: 16, color: "#6B7280", textAlign: "center", marginTop: 8, marginBottom: 12 },

  inputWrap: {
    height: 58, backgroundColor: "#F9FAFB",
    borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 16, marginTop: 16,
    justifyContent: "center", paddingLeft: 48, paddingRight: 48,
  },
  input: { fontSize: 16, color: "#111827" },
  leftIcon: { position: "absolute", left: 14, height: 58, width: 30, justifyContent: "center", alignItems: "center" },
  rightIcon: { position: "absolute", right: 12, height: 58, width: 34, justifyContent: "center", alignItems: "center" },

  forgot: { marginTop: 10, color: "#3B82F6", fontSize: 14, textAlign: "right" },

  primaryBtn: { marginTop: 20, height: 48, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  linkText: { color: "#6B7280", textAlign: "center" },
  linkStrong: { color: "#2563EB", fontWeight: "700" },
});
