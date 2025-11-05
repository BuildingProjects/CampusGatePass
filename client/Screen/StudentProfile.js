import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";

export default function StudentProfile({ navigation }) {
  const [name, setName] = useState("Roshan Kumar");
  const [roll, setRoll] = useState("CSE2026012");

  const handleSave = () => {
    Alert.alert(
      "Profile Updated",
      "Your changes have been saved successfully!"
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: () => navigation.replace("RoleSelection") },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder='Full Name'
        placeholderTextColor='#94A3B8'
      />
      <TextInput
        style={styles.input}
        value={roll}
        onChangeText={setRoll}
        placeholder='Roll Number'
        placeholderTextColor='#94A3B8'
      />

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.btnText}>Save Changes</Text>
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.btnText}>Sign Out</Text>
      </Pressable>
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
  saveBtn: {
    backgroundColor: "#2563EB",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  logoutBtn: {
    backgroundColor: "#DC2626",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
