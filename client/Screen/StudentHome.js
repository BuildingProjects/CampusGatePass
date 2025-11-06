import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import StudentProfile from "./StudentProfile";

const Tab = createBottomTabNavigator();

// ---------- STUDENT DASHBOARD ----------
function StudentDashboard() {
  const [student] = useState({
    name: "Roshan Kumar",
    roll: "CSE2026012",
    photo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  });

  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching QR from backend
    const fetchQr = async () => {
      try {
        // 🔹 Replace this later with your real backend URL
        // const response = await fetch(`https://your-backend.com/api/student/${student.roll}/qr`);
        // const data = await response.json();
        // setQrUrl(data.qr_url);

        // 🔹 Temporary QR code (static for now)
        const tempQr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Name:${encodeURIComponent(
          student.name
        )}%0ARoll:${encodeURIComponent(student.roll)}`;
        setQrUrl(tempQr);
      } catch (error) {
        Alert.alert("Error", "Failed to load QR code.");
        console.error("QR Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, []);

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

        {loading ? (
          <ActivityIndicator size='large' color='#2563EB' />
        ) : qrUrl ? (
          <Image
            source={{ uri: qrUrl }}
            style={styles.qrImage}
            resizeMode='contain'
          />
        ) : (
          <Text style={styles.errorText}>QR not available</Text>
        )}
      </View>
    </View>
  );
}

// ---------- MAIN COMPONENT ----------
export default function StudentHome({ navigation }) {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: () => navigation.replace("RoleSelector") },
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

// ---------- STYLES ----------
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
  qrImage: {
    width: 200,
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
});
