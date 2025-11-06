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
} from "react-native";

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Dummy response to simulate backend
    const response = {
      isVerified: false,
      role: role,
    };

    if (!response.isVerified) {
      navigation.replace("OTPScreen", { email, role });
    } else {
      if (role === "Student") navigation.replace("StudentHome");
      else if (role === "Guard") navigation.replace("GuardHome");
      else alert(`Logged in successfully as ${role}`);
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

            <Pressable style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.btnText}>Login</Text>
            </Pressable>

            {/* Show signup link only for Students */}
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
