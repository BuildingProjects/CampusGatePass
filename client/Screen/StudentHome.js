//---------------------Author Roshan---------------------------//

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import StudentProfile from "./StudentProfile";
import { useNavigation } from "@react-navigation/native";
const Tab = createBottomTabNavigator();
import { API_BASE_URL } from "@env"; // 🔹 Change to your server IP when on device
function EmptyScreen() {
  return null;
}
// ---------- STUDENT DASHBOARD ----------
function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const fetchStudentProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Error",
          "Authorization token missing. Please log in again."
        );
        setLoading(false);
        return;
      }

      console.log("Fetching the profile...");

      const response = await fetch(`${API_BASE_URL}/api/student/getprofile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log("Raw profile response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        Alert.alert(
          "Server Error",
          "Received invalid response from server. Check backend or API_BASE_URL."
        );
        setLoading(false);
        return;
      }

      if (!result.success) {
        switch (result.message) {
          case "Authorization token missing":
            Alert.alert("Error", "Token missing. Please log in again.");
            break;
          case "Invalid or expired token":
            Alert.alert("Session Expired", "Please log in again.");
            break;
          case "Access denied. Students only.":
            Alert.alert(
              "Access Denied",
              "Only students can access this section."
            );
            break;
          case "Account not verified":
            Alert.alert("Verification Required", "Please verify your account.");
            break;
          case "Profile not completed. Please complete your profile first.":
            navigation.reset({
              index: 0,
              routes: [{ name: "ProfileCompletionScreen" }],
            });
            break;
          case "Student not found":
            Alert.alert("Error", "Student record not found.");
            break;
          default:
            Alert.alert("Error", result.message || "Something went wrong.");
        }
        setLoading(false);
        return;
      }

      console.log("Profile loaded successfully:", result.data);
      setStudent(result.data);
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      Alert.alert(
        "Network Error",
        "Failed to connect to the server. Please ensure your backend is running and accessible."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator size='large' color='#2563EB' />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.screen}>
        <Text style={{ color: "#EF4444", fontSize: 16 }}>
          Failed to load student data.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: student.profilePhoto }} style={styles.avatar} />
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.roll}>Roll No: {student.rollNumber}</Text>
        <Text style={styles.roll}>Batch: {student.batch}</Text>
        <Text style={styles.roll}>Dept: {student.department}</Text>
      </View>

      {/* QR Section */}
      <View style={styles.qrContainer}>
        <Text style={styles.qrLabel}>Your Campus QR Pass</Text>
        {student.qrCode ? (
          <Image
            source={{ uri: student.qrCode }}
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
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("RoleSelector");
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
      {/* <Tab.Screen name='Profile' component={StudentProfile} /> */}
      <Tab.Screen
        name='Logout'
        component={EmptyScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Prevent tab navigation
            Alert.alert(
              "Logout",
              "Are you sure you want to sign out?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Logout",
                  style: "destructive",
                  onPress: () => handleLogout(), // 👈 call your logout logic
                },
              ],
              { cancelable: true }
            );
          },
        }}
        options={{
          tabBarLabel: "Logout",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='log-out-outline' size={size} color={color} />
          ),
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
