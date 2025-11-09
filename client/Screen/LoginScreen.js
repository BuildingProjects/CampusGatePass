//---------------------Author Roshan---------------------------//

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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Added for token storage
import { API_BASE_URL } from "@env";
import { CommonActions } from "@react-navigation/native";

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);

      console.log("➡️ Logging in with:", email, role);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: role.toLowerCase(),
          email: email.trim(),
          password,
        }),
      });

      const text = await response.text();
      console.log("⬅️ Raw Login Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("JSON parse error:", err);
        Alert.alert("Server Error", "Invalid server response.");
        return;
      }

      if (!response.ok || !data.success) {
        Alert.alert("Login Failed", data.message || "Please try again.");
        return;
      }

      const { token, role: userRole, email: userEmail, isVerified } = data.data;

      // ✅ Save token securely for later use
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", userRole);
      await AsyncStorage.setItem("email", userEmail);

      // ✅ Student Login Flow
      if (userRole === "student") {
        if (!isVerified) {
          console.log("User not verified → sending OTP...");

          const otpResponse = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const otpText = await otpResponse.text();
          console.log("⬅️ OTP Response:", otpText);

          let otpData;
          try {
            otpData = JSON.parse(otpText);
          } catch (err) {
            Alert.alert("Server Error", "Invalid OTP API response.");
            return;
          }

          if (!otpResponse.ok || !otpData.success) {
            Alert.alert(
              "Error",
              otpData.message || "Failed to send OTP. Try again later."
            );
            return;
          }

          Alert.alert(
            "OTP Sent",
            "OTP sent successfully to your registered email!"
          );

          // ✅ Navigate to OTP screen with token
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "OTPScreen",
                  params: { email: userEmail, role: userRole, token },
                },
              ],
            })
          );
          return;
        }

        // ✅ Verified student → navigate to StudentHome
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "StudentHome" }], // token retrieved from AsyncStorage later
          })
        );
      }

      // ✅ Guard Login Flow
      else if (userRole === "guard") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "GuardHome" }],
          })
        );
      }

      // ✅ Admin Login Flow
      else if (userRole === "admin") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "AdminHome" }],
          })
        );
      } else {
        Alert.alert("Success", `Logged in successfully as ${userRole}`);
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert(
        "Network Error",
        "Unable to connect. Please check your internet or backend server."
      );
    } finally {
      setLoading(false);
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
