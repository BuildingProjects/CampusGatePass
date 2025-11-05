import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import StudentProfile from "./StudentProfile";

const Tab = createBottomTabNavigator();

// ---------- MAIN HOME SCREEN ----------
function StudentDashboard() {
  const [student] = useState({
    name: "Roshan Kumar",
    roll: "CSE2026012",
    photo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // sample avatar
  });

  return (
    <View style={styles.screen}>
      {/* Student Info */}
      <View style={styles.profileSection}>
        <Image source={{ uri: student.photo }} style={styles.avatar} />
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.roll}>Roll No: {student.roll}</Text>
      </View>

      {/* QR Section */}
      <View style={styles.qrContainer}>
        <Text style={styles.qrLabel}>Your Campus QR Pass</Text>
        <View style={styles.qrBox}>
          <QRCode
            value={`Name: ${student.name}\nRoll: ${student.roll}`}
            size={180}
            color='#2563EB'
            backgroundColor='#fff'
          />
        </View>
      </View>
    </View>
  );
}

// ---------- MAIN COMPONENT WITH NAVIGATION ----------
export default function StudentHome({ navigation }) {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: () => navigation.replace("RoleSelection") },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: "#1E293B", borderTopWidth: 0 },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Profile") iconName = "person-outline";
          else if (route.name === "Logout") iconName = "log-out-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name='Home' component={StudentDashboard} />
      <Tab.Screen name='Profile' component={StudentProfile} />
      <Tab.Screen
        name='Logout'
        component={() => null}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#2563EB",
    marginBottom: 12,
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  roll: {
    color: "#cbd5e1",
    fontSize: 16,
    marginTop: 4,
  },
  qrContainer: {
    alignItems: "center",
  },
  qrLabel: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "600",
  },
  qrBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
});
