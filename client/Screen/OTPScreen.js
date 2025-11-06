//---------------------Author Roshan---------------------------//
import React, { useState, useRef } from "react";
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
export default function OTPScreen({ route, navigation }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false); // 🔹 Loader state
  const [resendTimer, setResendTimer] = useState(30);
  const inputRef = useRef(null);
  const { email, role, token } = route.params;

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit code.");
      return;
    }

    try {
      // Show loading feedback (optional)
      setLoading(true);

      console.log("➡️ Verifying OTP:", otp);

      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ include JWT token
        },
        body: JSON.stringify({
          otp: otp.trim(),
        }),
      });

      // Read raw text first (for debugging)
      const text = await response.text();
      console.log("⬅️ Raw Verify Response:", text);

      // Safely parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("JSON parse failed:", err);
        Alert.alert("Server Error", "Backend returned invalid response.");
        return;
      }

      console.log("Parsed Verify Response:", data);

      // Handle backend errors
      if (!response.ok) {
        Alert.alert("Error", data.message || "Server error occurred.");
        return;
      }

      if (!data.success) {
        // Handle all specific backend messages gracefully
        switch (data.message) {
          case "Authorization token missing":
            Alert.alert("Error", "Login session expired. Please login again.");
            navigation.replace("LoginScreen", { role });
            break;

          case "Invalid or expired token":
            Alert.alert(
              "Error",
              "Your session has expired. Please login again."
            );
            navigation.replace("LoginScreen", { role });
            break;

          case "Access denied. Students only.":
            Alert.alert("Access Denied", "Only students can verify OTP.");
            break;

          case "OTP is required":
            Alert.alert("Missing OTP", "Please enter your OTP.");
            break;

          case "Invalid OTP":
            Alert.alert("Invalid OTP", "The OTP you entered is incorrect.");
            break;

          case "Student account not found":
            Alert.alert("Error", "Student not found. Please re-login.");
            break;

          default:
            Alert.alert("Error", data.message || "Failed to verify OTP.");
        }
        return;
      }

      // ✅ OTP verified successfully
      Alert.alert("Success", "Account verified successfully!");

      if (role === "student") navigation.replace("StudentHome");
      else if (role === "guard") navigation.replace("GuardHome");
      else navigation.replace("AdminHome");
    } catch (error) {
      console.error("Verify OTP Error:", error);
      Alert.alert(
        "Network Error",
        "Unable to verify OTP. Please check your internet connection or backend server."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    try {
      // Restart the resend timer (30 seconds)
      setResendTimer(30);

      console.log("➡️ Sending resend OTP request...");

      const otpResponse = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ attach JWT token
        },
      });

      // Read response as text first (for safety)
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

      console.log("Parsed Resend OTP Response:", otpData);

      // Handle backend failure cases
      if (!otpResponse.ok || !otpData.success) {
        switch (otpData.message) {
          case "Authorization token missing":
            Alert.alert("Error", "Login session expired. Please login again.");
            navigation.replace("LoginScreen", { role });
            break;

          case "Invalid or expired token":
            Alert.alert("Error", "Session expired. Please login again.");
            navigation.replace("LoginScreen", { role });
            break;

          case "Access denied. Students only.":
            Alert.alert("Error", "Only students can resend OTP.");
            break;

          case "Account already verified":
            Alert.alert("Info", "Your account is already verified!");
            navigation.replace("StudentHome");
            break;

          default:
            Alert.alert("Error", otpData.message || "Failed to send OTP.");
        }
        return;
      }

      // ✅ Success
      Alert.alert("OTP Sent", `A new OTP has been sent to ${email}.`);
    } catch (error) {
      console.error("Resend OTP Error:", error);
      Alert.alert(
        "Network Error",
        "Unable to resend OTP. Please check your connection or try again."
      );
    }
  };

  // Countdown timer for resend button
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.heading}>OTP Verification</Text>
          <Text style={styles.subText}>
            Enter the 6-digit code sent to{" "}
            <Text style={{ color: "#3B82F6" }}>{email}</Text>
          </Text>

          <TextInput
            ref={inputRef}
            style={styles.input}
            keyboardType='number-pad'
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            placeholder='Enter OTP'
            placeholderTextColor='#94A3B8'
          />

          <Pressable
            style={styles.verifyBtn}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={styles.verifyText}>Verify OTP</Text>
            )}
          </Pressable>

          <TouchableOpacity
            onPress={handleResend}
            disabled={resendTimer > 0}
            style={[styles.resendBtn, { opacity: resendTimer > 0 ? 0.5 : 1 }]}
          >
            <Text style={styles.resendText}>
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  heading: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
  },
  subText: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    width: "60%",
    backgroundColor: "#1E293B",
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
    letterSpacing: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  verifyBtn: {
    backgroundColor: "#10B981",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  verifyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendBtn: {
    marginTop: 20,
  },
  resendText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
});
