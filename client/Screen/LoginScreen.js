import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "@env";
import { CommonActions } from "@react-navigation/native";
export default function LoginScreen({ route, navigation }) {
  const { role } = route.params;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 🔹 Loader state

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      setLoading(true); // Start loader

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: role.toLowerCase(),
          email: email.trim(),
          password: password,
        }),
      });

      // Parse response JSON
      const data = await response.json();

      // 🔍 Debug log (optional)
      console.log("Login Response:", data);

      // Check for HTTP-level errors
      if (!response.ok) {
        alert("Server Error: Something went wrong!");
        return;
      }

      // Handle backend-defined errors
      if (!data.success) {
        alert(data.message || "Login failed. Please try again.");
        return;
      }

      // ✅ Extract the main data object from backend response
      const { token, role: userRole, email: userEmail, isVerified } = data.data;

      // Save token if needed (for future authenticated requests)
      // await AsyncStorage.setItem("authToken", token);

      // ✅ Conditional navigation based on role and verification
      if (userRole === "student") {
        if (isVerified === false) {
          // Step 2: Send OTP request
          console.log("User not verified. Sending OTP...");

          const otpResponse = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ Attach token
            },
          });

          const otpData = await otpResponse.json();
          console.log("Send OTP Response:", otpData);

          if (!otpResponse.ok || !otpData.success) {
            // Handle specific backend messages
            alert(
              otpData.message || "Failed to send OTP. Please try again later."
            );
            return;
          }
          alert("OTP sent successfully to your registered email!");
          navigation.replace("OTPScreen", {
            email: userEmail,
            role: userRole,
            token,
          });
        } else {
          CommonActions.reset({
            index: 0,
            routes: [{ name: "StudentHome" }], // <-- must match your Stack.Screen name
          });
        }
      } else if (userRole === "guard") {
        navigation.replace("GuardHome");
      } else if (userRole === "admin") {
        navigation.replace("AdminHome");
      } else {
        alert(`Logged in successfully as ${userRole}`);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Network error! Please check your connection or backend server.");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.container}>
            <Text style={styles.heading}>Login as {role}</Text>

            <TextInput
              style={styles.input}
              placeholder='Email'
              placeholderTextColor='#94A3B8'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder='Password'
              placeholderTextColor='#94A3B8'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
              style={[styles.loginBtn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size='small' color='#fff' />
              ) : (
                <Text style={styles.btnText}>Login</Text>
              )}
            </Pressable>

            {role === "Student" && (
              <TouchableOpacity
                onPress={() => navigation.navigate("SignupScreen", { role })}
              >
                <Text style={styles.switchText}>
                  Don’t have an account?{" "}
                  <Text style={styles.linkText}>Register</Text>
                </Text>
              </TouchableOpacity>
            )}
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
  loginBtn: {
    backgroundColor: "#10B981",
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
