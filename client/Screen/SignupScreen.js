import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "@env";

export default function SignupScreen({ route, navigation }) {
  const { role } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    console.log("➡️ Sending signup request...");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000); // ⏰ 7s timeout

      const response = await fetch(`${API_BASE_URL}/api/auth/registerStudent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      console.log("✅ Got response status:", response.status);

      const text = await response.text();
      console.log("🧾 Raw response text:", text);

      const data = JSON.parse(text);
      console.log("✅ Parsed JSON:", data);

      if (!response.ok) throw new Error(data.message || "Failed to register");

      alert(data.message || "Registration successful!");
      navigation.navigate("LoginScreen", { role });
    } catch (err) {
      console.error("❌ Signup Error:", err);
      alert(err.name === "AbortError" ? "Request timed out" : err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.heading}>Register as {role}</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Re-enter Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={repassword}
              onChangeText={setRepassword}
            />

            <Pressable
              style={[styles.signupBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Register</Text>
              )}
            </Pressable>

            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen", { role })}
            >
              <Text style={styles.switchText}>
                Already registered? <Text style={styles.linkText}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  heading: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#1E293B",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  signupBtn: {
    backgroundColor: "#2563EB",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchText: {
    color: "#cbd5e1",
    marginTop: 20,
    fontSize: 14,
  },
  linkText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
