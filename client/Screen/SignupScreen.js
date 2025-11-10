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
  Alert,
} from "react-native";
import { API_BASE_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SignupScreen({ route, navigation }) {
  const { role } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSignup = async () => {
    if (!name || !email || !password || !repassword) {
      Alert.alert("Missing Fields", "Please fill in all fields!");
      return;
    }
    if (password !== repassword) {
      Alert.alert("Password Mismatch", "Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/registerStudent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      Alert.alert(
        "Success! 🎉",
        "Account created successfully. Please login to continue.",
        [
          {
            text: "Login Now",
            onPress: () => navigation.navigate("LoginScreen", { role }),
          },
        ]
      );
    } catch (err) {
      console.error("Signup Error:", err);
      Alert.alert("Registration Failed", err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0A0E1A", "#1E293B"]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name='person-add-outline'
                    size={48}
                    color='#3B82F6'
                  />
                </View>
                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.subheading}>
                  Register as {role} to get started
                </Text>
              </View>

              {/* Signup Form */}
              <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "name" && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name='person-outline'
                      size={20}
                      color={focusedInput === "name" ? "#3B82F6" : "#64748B"}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Enter your full name'
                      placeholderTextColor='#64748B'
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedInput("name")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

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
                      color={focusedInput === "email" ? "#3B82F6" : "#64748B"}
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
                        focusedInput === "password" ? "#3B82F6" : "#64748B"
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Create a password'
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
                  <Text style={styles.helperText}>
                    Must be at least 6 characters
                  </Text>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "repassword" && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name='lock-closed-outline'
                      size={20}
                      color={
                        focusedInput === "repassword" ? "#3B82F6" : "#64748B"
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Re-enter your password'
                      placeholderTextColor='#64748B'
                      secureTextEntry={!showRePassword}
                      value={repassword}
                      onChangeText={setRepassword}
                      onFocus={() => setFocusedInput("repassword")}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowRePassword(!showRePassword)}
                    >
                      <Ionicons
                        name={
                          showRePassword ? "eye-off-outline" : "eye-outline"
                        }
                        size={20}
                        color='#64748B'
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Register Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.signupButton,
                    { opacity: loading || pressed ? 0.8 : 1 },
                  ]}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    style={styles.signupGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size='small' color='#FFF' />
                    ) : (
                      <>
                        <Text style={styles.signupButtonText}>
                          Create Account
                        </Text>
                        <Ionicons name='arrow-forward' size={20} color='#FFF' />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("LoginScreen", { role })}
                  >
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              {/* <View style={styles.footer}>
                <View style={styles.securityBadge}>
                  <Ionicons name='shield-checkmark' size={16} color='#22C55E' />
                  <Text style={styles.securityText}>Secure Registration</Text>
                </View>
              </View> */}
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
    marginBottom: 24,
    marginTop: 60,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(59,130,246,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 16,
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
  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  signupButton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
  },
  signupGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  signupButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: {
    color: "#94A3B8",
    fontSize: 15,
  },
  loginLink: {
    color: "#3B82F6",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
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
