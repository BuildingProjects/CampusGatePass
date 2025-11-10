//---------------------Author Roshan---------------------------//
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "@env";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function OTPScreen({ route, navigation }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRefs = useRef([]);
  const { email, role, token } = route.params;

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value, index) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (index === 5 && value) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode = null) => {
    const otpString = otpCode || otp.join("");

    if (otpString.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      console.log("➡️ Verifying OTP:", otpString);

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          otp: otpString.trim(),
        }),
      });

      const text = await response.text();
      console.log("⬅️ Raw Verify Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("JSON parse failed:", err);
        Alert.alert("Server Error", "Backend returned invalid response.");
        return;
      }

      if (!response.ok || !data.success) {
        Alert.alert(
          "Verification Failed",
          data.message || "Invalid OTP. Please try again."
        );
        // Clear OTP inputs on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      Alert.alert("Success! 🎉", "Account verified successfully!");

      if (role === "student") {
        const studentData = data.data || {};
        const { isProfileCompleted } = studentData;

        if (!isProfileCompleted) {
          navigation.reset({
            index: 0,
            routes: [{ name: "ProfileCompletionScreen" }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "StudentHome" }],
          });
        }
      } else if (role === "guard") {
        navigation.replace("GuardHome");
      } else {
        navigation.replace("AdminHome");
      }
    } catch (error) {
      console.error("Verify OTP Error:", error);
      Alert.alert(
        "Network Error",
        "Unable to verify OTP. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendTimer(30);
      console.log("➡️ Sending resend OTP request...");

      const otpResponse = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await otpResponse.text();
      console.log("⬅️ Raw Resend OTP Response:", text);

      let otpData;
      try {
        otpData = JSON.parse(text);
      } catch (err) {
        console.error("❌ JSON parse failed for resend OTP:", err);
        Alert.alert(
          "Server Error",
          "Backend returned invalid response format."
        );
        return;
      }

      if (!otpResponse.ok || !otpData.success) {
        Alert.alert("Error", otpData.message || "Failed to send OTP.");
        return;
      }

      Alert.alert("OTP Sent", `A new OTP has been sent to ${email}.`);
      // Clear existing OTP
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP Error:", error);
      Alert.alert("Network Error", "Unable to resend OTP. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#0A0E1A", "#1E293B"]} style={styles.gradient}>
      <KeyboardAvoidingView
        // behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                <Ionicons name='mail-outline' size={40} color='#3B82F6' />
              </View>
              <Text style={styles.heading}>Verify Your Email</Text>
              <Text style={styles.subheading}>
                Enter the 6-digit code sent to
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* OTP Input Boxes */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    focusedIndex === index && styles.otpInputFocused,
                    digit && styles.otpInputFilled,
                  ]}
                  keyboardType='number-pad'
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Verify Button */}
            <Pressable
              style={({ pressed }) => [
                styles.verifyButton,
                { opacity: loading || pressed ? 0.8 : 1 },
              ]}
              onPress={() => handleVerify()}
              disabled={loading}
            >
              <LinearGradient
                colors={["#22C55E", "#16A34A"]}
                style={styles.verifyGradient}
              >
                {loading ? (
                  <ActivityIndicator size='small' color='#FFF' />
                ) : (
                  <>
                    <Text style={styles.verifyText}>Verify & Continue</Text>
                    <Ionicons name='checkmark-circle' size={20} color='#FFF' />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Resend Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendLabel}>Didn't receive the code?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendTimer > 0}
                style={{ marginTop: 8 }}
              >
                <View
                  style={[
                    styles.resendButton,
                    { opacity: resendTimer > 0 ? 0.5 : 1 },
                  ]}
                >
                  <Ionicons
                    name='refresh-outline'
                    size={16}
                    color={resendTimer > 0 ? "#64748B" : "#3B82F6"}
                  />
                  <Text
                    style={[
                      styles.resendText,
                      { color: resendTimer > 0 ? "#64748B" : "#3B82F6" },
                    ]}
                  >
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Resend Code"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
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
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59,130,246,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 8,
  },
  heading: {
    color: "#F1F5F9",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subheading: {
    color: "#94A3B8",
    fontSize: 15,
    marginBottom: 4,
  },
  emailText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "700",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    color: "#F1F5F9",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  otpInputFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#0F172A",
  },
  otpInputFilled: {
    backgroundColor: "#0F172A",
    borderColor: "#22C55E",
  },
  verifyButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
    marginBottom: 24,
  },
  verifyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  verifyText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  resendSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  resendLabel: {
    color: "#94A3B8",
    fontSize: 14,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resendText: {
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(100,116,139,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  infoText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
});
