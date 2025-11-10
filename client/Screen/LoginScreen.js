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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const getRoleConfig = () => {
    const configs = {
      Student: {
        icon: "school-outline",
        color: "#3B82F6",
        gradient: ["#3B82F6", "#2563EB"],
      },
      Admin: {
        icon: "shield-checkmark-outline",
        color: "#8B5CF6",
        gradient: ["#8B5CF6", "#7C3AED"],
      },
      Guard: {
        icon: "scan-outline",
        color: "#F59E0B",
        gradient: ["#F59E0B", "#D97706"],
      },
    };
    return configs[role] || configs.Student;
  };

  const roleConfig = getRoleConfig();

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

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", userRole);
      await AsyncStorage.setItem("email", userEmail);

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

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "StudentHome" }],
          })
        );
      } else if (userRole === "guard") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "GuardHome" }],
          })
        );
      } else if (userRole === "admin") {
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
    <LinearGradient colors={["#0A0E1A", "#1E293B"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Back Button */}
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name='arrow-back' size={24} color='#F1F5F9' />
              </Pressable>

              {/* Header with Icon */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: roleConfig.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={roleConfig.icon}
                    size={48}
                    color={roleConfig.color}
                  />
                </View>
                <Text style={styles.heading}>Welcome Back</Text>
                <Text style={styles.subheading}>
                  Sign in as {role} to continue
                </Text>
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "email" && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name='mail-outline'
                      size={20}
                      color={
                        focusedInput === "email" ? roleConfig.color : "#64748B"
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Enter your email'
                      placeholderTextColor='#64748B'
                      keyboardType='email-address'
                      autoCapitalize='none'
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "password" && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name='lock-closed-outline'
                      size={20}
                      color={
                        focusedInput === "password"
                          ? roleConfig.color
                          : "#64748B"
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Enter your password'
                      placeholderTextColor='#64748B'
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color='#64748B'
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.loginButton,
                    { opacity: loading || pressed ? 0.8 : 1 },
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={roleConfig.gradient}
                    style={styles.loginGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size='small' color='#FFF' />
                    ) : (
                      <>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <Ionicons name='arrow-forward' size={20} color='#FFF' />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Register Link for Students */}
                {role === "Student" && (
                  <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                      Don't have an account?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("SignupScreen", { role })
                      }
                    >
                      <Text
                        style={[
                          styles.registerLink,
                          { color: roleConfig.color },
                        ]}
                      >
                        Create Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.securityBadge}>
                  <Ionicons name='shield-checkmark' size={16} color='#22C55E' />
                  <Text style={styles.securityText}>Secure Login</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 8,
  },
  heading: {
    fontSize: 32,
    color: "#F1F5F9",
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#0F172A",
  },
  input: {
    flex: 1,
    color: "#F1F5F9",
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 12,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
  },
  loginGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#94A3B8",
    fontSize: 15,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  securityText: {
    color: "#22C55E",
    fontSize: 13,
    fontWeight: "600",
  },
});
