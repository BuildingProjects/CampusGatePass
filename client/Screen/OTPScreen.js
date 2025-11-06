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
} from "react-native";

export default function OTPScreen({ route, navigation }) {
  const { email, role } = route.params;
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const inputRef = useRef(null);

  const handleVerify = () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit code.");
      return;
    }

    // Dummy verification logic (replace with API)
    if (otp === "123456") {
      Alert.alert("Success", "OTP verified successfully!");
      if (role === "Student") navigation.replace("StudentHome");
      else if (role === "Guard") navigation.replace("GuardHome");
      else navigation.replace("AdminHome");
    } else {
      Alert.alert("Error", "Invalid OTP. Please try again.");
    }
  };

  const handleResend = () => {
    setResendTimer(30);
    Alert.alert("OTP Sent", `A new OTP has been sent to ${email}.`);
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

          <Pressable style={styles.verifyBtn} onPress={handleVerify}>
            <Text style={styles.verifyText}>Verify OTP</Text>
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
