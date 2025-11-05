import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
} from "react-native";

export default function SignupScreen({ route, navigation }) {
  const { role } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (!name || !email || !roll || !password) {
      alert("Please fill all fields!");
      return;
    }
    alert(`Signup successful as ${role}`);
    // Here you can navigate to dashboard or login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Signup as {role}</Text>

      <TextInput
        style={styles.input}
        placeholder='Full Name'
        placeholderTextColor='#94A3B8'
        value={name}
        onChangeText={setName}
      />
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
        placeholder='Roll Number'
        placeholderTextColor='#94A3B8'
        value={roll}
        onChangeText={setRoll}
      />
      <TextInput
        style={styles.input}
        placeholder='Password'
        placeholderTextColor='#94A3B8'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.signupBtn} onPress={handleSignup}>
        <Text style={styles.btnText}>Signup</Text>
      </Pressable>

      <TouchableOpacity
        onPress={() => navigation.navigate("LoginScreen", { role })}
      >
        <Text style={styles.switchText}>
          Already registered? <Text style={styles.linkText}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </View>
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
