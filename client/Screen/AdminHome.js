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
  StatusBar,
  Platform,
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

  useEffect(() => {
    fetchAdminProfile();
    fetchStats();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "RoleSelector" }],
          })
        );
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAdmin(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAdminProfile(), fetchStats()]);
    setRefreshing(false);
  };

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
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Transparent status bar to merge header cleanly */}
      <StatusBar
        translucent
        backgroundColor='#1E293B'
        barStyle='light-content'
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor='#3B82F6'
              colors={["#3B82F6"]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header (now flush to top) */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Welcome Back! 👋</Text>
                <Text style={styles.adminName}>{admin?.name || "Admin"}</Text>
                <Text style={styles.role}>System Administrator</Text>
              </View>
              <Pressable
                style={styles.profileIcon}
                onPress={() => Alert.alert("Profile", "Coming soon!")}
              >
                <Ionicons
                  name='person-circle-outline'
                  size={48}
                  color='#3B82F6'
                />
              </Pressable>
            </View>
          </View>

          {/* Dashboard Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsGrid}>
              {[
                {
                  label: "Total Scans",
                  value: stats.todayScans,
                  icon: "scan-outline",
                  color: "#3B82F6",
                },
                {
                  label: "Entries",
                  value: stats.todayEntries,
                  icon: "arrow-down-outline",
                  color: "#22C55E",
                },
                {
                  label: "Exits",
                  value: stats.todayExits,
                  icon: "arrow-up-outline",
                  color: "#EF4444",
                },
              ].map((item, i) => (
                <View
                  key={i}
                  style={[styles.statCard, { borderTopColor: item.color }]}
                >
                  <Ionicons name={item.icon} size={22} color={item.color} />
                  <Text style={styles.statNumber}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

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
            {[
              {
                title: "View All Logs",
                description: "Check complete activity history",
                icon: "document-text-outline",
                color: "#3B82F6",
                route: "ViewLogsScreen",
              },
              {
                title: "Manage Guard",
                description: "Add, edit or remove guards",
                icon: "shield-checkmark-outline",
                color: "#22C55E",
                route: "ManageGuardsScreen",
              },
              {
                title: "Manage Admin",
                description: "Add, edit or remove admin",
                icon: "person-add-outline",
                color: "#3B82F6",
                route: "ManageAdminScreen",
              },
            ].map((item, i) => (
              <Pressable
                key={i}
                style={styles.actionCard}
                onPress={() => navigation.navigate(item.route)}
              >
                <View
                  style={[
                    styles.actionIconBg,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionDescription}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color='#64748B' />
              </Pressable>
            ))}
          </View>

          {/* Logout */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name='log-out-outline' size={20} color='#EF4444' />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>

          <Text style={styles.footerText}>Campus Guard System v1.0</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E1A",
    paddingTop:
      Platform.OS === "android"
        ? 0
        : StatusBar.currentHeight
        ? StatusBar.currentHeight
        : 0,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E1A",
  },
  loadingText: { color: "#94A3B8", marginTop: 12, fontSize: 15 },

  header: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadowStyle,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { color: "#94A3B8", fontSize: 15 },
  adminName: { color: "#F1F5F9", fontSize: 26, fontWeight: "800" },
  role: { color: "#64748B", fontSize: 13 },
  profileIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  statsSection: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
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
    borderTopWidth: 3,
    ...shadowStyle,
  },
  statNumber: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  guardsStatus: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    ...shadowStyle,
  },
  guardStatItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  guardStatText: { color: "#94A3B8", fontSize: 14, fontWeight: "600" },
  actionsSection: { paddingHorizontal: 20, marginTop: 25 },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...shadowStyle,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionContent: { flex: 1 },
  actionTitle: { color: "#F1F5F9", fontSize: 16, fontWeight: "700" },
  actionDescription: { color: "#64748B", fontSize: 13 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
    marginHorizontal: 20,
    marginTop: 25,
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
  },
  footerText: {
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
    marginTop: 25,
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
