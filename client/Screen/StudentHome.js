//---------------------Author Roshan---------------------------//

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL } from "@env";

const Tab = createBottomTabNavigator();

function EmptyScreen() {
  return null;
}

// ---------- STUDENT DASHBOARD ----------
function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      // console.log("Raw profile response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        Alert.alert("Server Error", "Received invalid response from server.");
        setLoading(false);
        return;
      }

      if (!result.success) {
        if (
          result.message ===
          "Profile not completed. Please complete your profile first."
        ) {
          navigation.reset({
            index: 0,
            routes: [{ name: "ProfileCompletionScreen" }],
          });
        } else {
          Alert.alert("Error", result.message || "Something went wrong.");
        }
        setLoading(false);
        return;
      }

      console.log("Profile loaded successfully:", result.data);
      setStudent(result.data);
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      Alert.alert("Network Error", "Failed to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudentProfile();
  };

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#3B82F6' />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name='alert-circle-outline' size={64} color='#EF4444' />
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorText}>Unable to fetch student data</Text>
        <Pressable style={styles.retryButton} onPress={fetchStudentProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0A0E1A", "#1E293B"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor='#3B82F6'
              colors={["#3B82F6"]}
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            {/* <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Welcome Back! 👋</Text>
                <Text style={styles.studentName}>{student.name}</Text>
              </View>
              <Image
                source={{ uri: student.profilePhoto }}
                style={styles.headerAvatar}
              />
            </View> */}
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: student.profilePhoto }}
                style={styles.profileImage}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name='checkmark-circle' size={24} color='#22C55E' />
              </View>
            </View>

            <Text style={styles.cardName}>{student.name}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name='card-outline' size={20} color='#3B82F6' />
                </View>
                <Text style={styles.infoLabel}>Roll Number</Text>
                <Text style={styles.infoValue}>{student.rollNumber}</Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name='school-outline' size={20} color='#8B5CF6' />
                </View>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{student.department}</Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name='calendar-outline' size={20} color='#F59E0B' />
                </View>
                <Text style={styles.infoLabel}>Batch</Text>
                <Text style={styles.infoValue}>{student.batch}</Text>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name='mail-outline' size={20} color='#22C55E' />
                </View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={[styles.infoValue, { fontSize: 12 }]}>
                  {student.email}
                </Text>
              </View>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <View style={styles.qrHeader}>
              <Ionicons name='qr-code-outline' size={24} color='#3B82F6' />
              <Text style={styles.qrTitle}>Your Digital Pass</Text>
            </View>

            {student.qrCode ? (
              <View style={styles.qrCard}>
                <View style={styles.qrWrapper}>
                  <Image
                    source={{ uri: student.qrCode }}
                    style={styles.qrImage}
                    resizeMode='contain'
                  />
                </View>
                <View style={styles.qrFooter}>
                  <View style={styles.qrInfoBadge}>
                    <Ionicons
                      name='information-circle'
                      size={16}
                      color='#64748B'
                    />
                    <Text style={styles.qrInfoText}>
                      Show this QR at campus gates
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.qrErrorCard}>
                <Ionicons
                  name='alert-circle-outline'
                  size={48}
                  color='#EF4444'
                />
                <Text style={styles.qrErrorText}>QR Code not available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#1E293B",
          borderTopWidth: 0,
          elevation: 12,
          height: 60,
          marginHorizontal: 20,
          marginBottom: 18,
          borderRadius: 20,
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 8,
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#64748B",
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Logout") iconName = "log-out-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name='Home'
        component={StudentDashboard}
        options={{
          tabBarLabel: "Dashboard",
        }}
      />
      <Tab.Screen
        name='Logout'
        component={EmptyScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Alert.alert(
              "Logout",
              "Are you sure you want to sign out?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Logout",
                  style: "destructive",
                  onPress: () => handleLogout(),
                },
              ],
              { cancelable: true }
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0A0E1A",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#94A3B8",
    marginTop: 12,
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0A0E1A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: "#F1F5F9",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#94A3B8",
    fontSize: 15,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    backgroundColor: "#1E293B",
    // paddingHorizontal: 20,
    // paddingTop: 20,
    // paddingBottom: 25,
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
    // elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  studentName: {
    color: "#F1F5F9",
    fontSize: 24,
    fontWeight: "800",
  },
  headerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: "#3B82F6",
  },
  profileCard: {
    backgroundColor: "#1E293B",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 4,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#3B82F6",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 2,
  },
  cardName: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  infoItem: {
    width: "48%",
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  qrSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  qrHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  qrTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
  },
  qrCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 4,
  },
  qrWrapper: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrFooter: {
    alignItems: "center",
  },
  qrInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  qrInfoText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  qrErrorCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
  },
  qrErrorText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  statsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },
  statValue: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
});
