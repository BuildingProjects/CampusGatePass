import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StatusBar,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function RoleSelector({ navigation }) {
  const handleRoleSelect = (role) => {
    navigation.navigate("LoginScreen", { role });
  };

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <Text style={styles.title}>Campus Gate Pass</Text>
          <Text style={styles.subtitle}>Select your role to continue</Text>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.studentBtn]}
              onPress={() => handleRoleSelect("Student")}
            >
              <Text style={styles.btnText}>Student</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.adminBtn]}
              onPress={() => handleRoleSelect("Admin")}
            >
              <Text style={styles.btnText}>Admin</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.guardBtn]}
              onPress={() => handleRoleSelect("Guard")}
            >
              <Text style={styles.btnText}>Guard</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  button: {
    width: "80%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  studentBtn: {
    backgroundColor: "#2563EB", // Blue
  },
  adminBtn: {
    backgroundColor: "#10B981", // Green
  },
  guardBtn: {
    backgroundColor: "#F59E0B", // Amber
  },
  btnText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
