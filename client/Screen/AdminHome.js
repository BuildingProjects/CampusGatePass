//---------------------Author Roshan---------------------------//
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";

export default function AdminHome({ navigation }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalGuards: 0,
    activeGuards: 0,
    todayScans: 0,
    todayEntries: 0,
    todayExits: 0,
  });

  // ✅ Fetch admin profile from backend
  const fetchAdminProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session Expired", "Please log in again.");
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "RoleSelector" }],
          })
        );
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ Invalid JSON:", text);
        Alert.alert("Server Error", "Invalid response from backend.");
        setLoading(false);
        return;
      }

      if (!response.ok || !data.success) {
        Alert.alert("Error", data.message || "Failed to fetch admin details.");
        setLoading(false);
        return;
      }

      setAdmin(data.data);
    } catch (error) {
      console.error("❌ Profile Fetch Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard-stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("❌ Stats Fetch Error:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAdminProfile(), fetchStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAdminProfile();
    fetchStats();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "RoleSelector" }],
            })
          );
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#3B82F6' />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
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
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome Back! 👋</Text>
              <Text style={styles.adminName}>{admin?.name || "Admin"}</Text>
              <Text style={styles.role}>System Administrator</Text>
            </View>
            <Pressable
              style={styles.profileIcon}
              onPress={() =>
                Alert.alert("Profile", "View profile feature coming soon!")
              }
            >
              <Ionicons
                name='person-circle-outline'
                size={48}
                color='#3B82F6'
              />
            </Pressable>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.primaryCard]}>
              <View style={styles.statIconContainer}>
                <Ionicons name='scan-outline' size={24} color='#3B82F6' />
              </View>
              <Text style={styles.statNumber}>{stats.todayScans}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>

            <View style={[styles.statCard, styles.successCard]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statEmoji}>→</Text>
              </View>
              <Text style={styles.statNumber}>{stats.todayEntries}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>

            <View style={[styles.statCard, styles.dangerCard]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statEmoji}>←</Text>
              </View>
              <Text style={styles.statNumber}>{stats.todayExits}</Text>
              <Text style={styles.statLabel}>Exits</Text>
            </View>
          </View>

          {/* Guards Status */}
          <View style={styles.guardsStatus}>
            <View style={styles.guardStatItem}>
              <Ionicons name='shield-checkmark' size={20} color='#22C55E' />
              <Text style={styles.guardStatText}>
                {stats.activeGuards} Active Guards
              </Text>
            </View>
            <View style={styles.guardStatItem}>
              <Ionicons name='people-outline' size={20} color='#94A3B8' />
              <Text style={styles.guardStatText}>
                {stats.totalGuards} Total Guards
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Pressable
            style={[styles.actionCard, styles.primaryAction]}
            onPress={() => navigation.navigate("ViewLogsScreen")}
          >
            <View style={styles.actionIconBg}>
              <Ionicons
                name='document-text-outline'
                size={24}
                color='#3B82F6'
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View All Logs</Text>
              <Text style={styles.actionDescription}>
                Check complete activity history
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#64748B' />
          </Pressable>

          <Pressable
            style={[styles.actionCard, styles.successAction]}
            onPress={() => navigation.navigate("ManageGuardsScreen")}
          >
            <View style={styles.actionIconBg}>
              <Ionicons
                name='shield-checkmark-outline'
                size={24}
                color='#22C55E'
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Guards</Text>
              <Text style={styles.actionDescription}>
                Add, edit or remove guards
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#64748B' />
          </Pressable>

          <Pressable
            style={[styles.actionCard, styles.warningAction]}
            onPress={() =>
              Alert.alert("Reports", "Generate reports feature coming soon!")
            }
          >
            <View style={styles.actionIconBg}>
              <Ionicons name='stats-chart-outline' size={24} color='#F59E0B' />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Generate Reports</Text>
              <Text style={styles.actionDescription}>
                Export activity reports
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#64748B' />
          </Pressable>

          <Pressable
            style={[styles.actionCard, styles.infoAction]}
            onPress={() =>
              Alert.alert("Settings", "System settings coming soon!")
            }
          >
            <View style={styles.actionIconBg}>
              <Ionicons name='settings-outline' size={24} color='#8B5CF6' />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>System Settings</Text>
              <Text style={styles.actionDescription}>
                Configure system preferences
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color='#64748B' />
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name='log-out-outline' size={20} color='#EF4444' />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Campus Guard System v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E1A",
  },
  loadingText: {
    color: "#94A3B8",
    marginTop: 12,
    fontSize: 15,
  },
  header: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
  adminName: {
    color: "#F1F5F9",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 2,
  },
  role: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  profileIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  sectionTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  primaryCard: {
    borderTopWidth: 3,
    borderTopColor: "#3B82F6",
  },
  successCard: {
    borderTopWidth: 3,
    borderTopColor: "#22C55E",
  },
  dangerCard: {
    borderTopWidth: 3,
    borderTopColor: "#EF4444",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 24,
    color: "#F1F5F9",
  },
  statNumber: {
    color: "#F1F5F9",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  guardsStatus: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    elevation: 3,
  },
  guardStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  guardStatText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  actionDescription: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: "center",
    marginTop: 25,
    paddingBottom: 10,
  },
  footerText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
  },
});
