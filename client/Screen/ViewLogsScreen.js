//---------------------Author Ankur---------------------------//
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";

export default function ViewLogsScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all logs initially
  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/log/getalllogs`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (!response.ok || !data.success) {
        Alert.alert("Error", data.message || "Failed to fetch logs.");
        setLogs([]);
        return;
      }

      setLogs(data.data || []);
    } catch (error) {
      console.error("❌ Logs Fetch Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch logs for a specific roll number
  const searchLogs = async () => {
    try {
      if (searchQuery.trim() === "") {
        fetchAllLogs();
        return;
      }

      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/log/getlog?rollNumber=${encodeURIComponent(
          searchQuery.trim()
        )}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const text = await response.text();
      const data = JSON.parse(text);

      if (!response.ok || !data.success) {
        Alert.alert("Error", data.message || "Failed to fetch logs.");
        setLogs([]);
        return;
      }

      setLogs(data.data || []);
    } catch (error) {
      console.error("❌ Search Logs Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLogs();
  }, []);

  const handleSearch = () => {
    Keyboard.dismiss();
    searchLogs();
  };

  const renderItem = ({ item }) => (
    <View style={styles.logCard}>
      <View style={styles.logRow}>
        <Text style={styles.name}>{String(item.name || "Unknown")}</Text>
        <Text
          style={[
            styles.status,
            item.action === "ENTRY" ? styles.entry : styles.exit,
          ]}
        >
          {String(item.action?.toUpperCase() || "UNKNOWN")}
        </Text>
      </View>
      <Text style={styles.roll}>Roll: {String(item.rollNumber || "N/A")}</Text>
      <Text style={styles.time}>
        {item.timestamp
          ? new Date(item.timestamp).toLocaleString()
          : "No timestamp"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.container}>
        {/* ✅ Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#F1F5F9" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>All Logs</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Roll Number..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                fetchAllLogs();
              }}
            >
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Logs List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Fetching logs...</Text>
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={48} color="#475569" />
            <Text style={styles.noLogsText}>No logs found</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },

  // ----- ✅ UNIFIED HEADER -----
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#1E293B",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 12 : 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  // ----- SEARCH -----
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    marginHorizontal: 20,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    color: "#F1F5F9",
    fontSize: 15,
    paddingHorizontal: 8,
  },

  // ----- LIST -----
  listContainer: {
    paddingBottom: 100,
    marginHorizontal: 20,
  },
  logCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
  },
  roll: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 14,
  },
  time: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 13,
  },
  status: {
    fontWeight: "700",
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    textTransform: "uppercase",
  },
  entry: {
    backgroundColor: "rgba(34,197,94,0.15)",
    color: "#22C55E",
  },
  exit: {
    backgroundColor: "rgba(239,68,68,0.15)",
    color: "#EF4444",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#94A3B8",
    marginTop: 12,
    fontSize: 15,
  },
  noLogsText: {
    color: "#64748B",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
