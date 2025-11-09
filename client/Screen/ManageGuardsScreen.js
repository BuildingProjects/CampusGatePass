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
  TextInput,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";

export default function ManageGuardsScreen({ navigation }) {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/guards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setGuards(data.data || []);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch guards");
      }
    } catch (error) {
      console.error("❌ Fetch Guards Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuards();
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedGuard(null);
    setFormData({ name: "", email: "", phone: "", password: "" });
    setModalVisible(true);
  };

  const openEditModal = (guard) => {
    setEditMode(true);
    setSelectedGuard(guard);
    setFormData({
      name: guard.name,
      email: guard.email,
      phone: guard.phone || "",
      password: "",
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert("Validation Error", "Name and email are required");
      return;
    }

    if (!editMode && !formData.password) {
      Alert.alert("Validation Error", "Password is required for new guards");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const url = editMode
        ? `${API_BASE_URL}/api/admin/guards/${selectedGuard._id}`
        : `${API_BASE_URL}/api/admin/guards`;

      const response = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          editMode ? "Guard updated successfully" : "Guard added successfully"
        );
        setModalVisible(false);
        fetchGuards();
      } else {
        Alert.alert("Error", data.message || "Operation failed");
      }
    } catch (error) {
      console.error("❌ Submit Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  const handleDelete = (guard) => {
    Alert.alert(
      "Delete Guard",
      `Are you sure you want to remove ${guard.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${API_BASE_URL}/api/admin/guards/${guard._id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();
              if (response.ok && data.success) {
                Alert.alert("Success", "Guard removed successfully");
                fetchGuards();
              } else {
                Alert.alert("Error", data.message || "Failed to delete guard");
              }
            } catch (error) {
              console.error("❌ Delete Error:", error);
              Alert.alert("Network Error", "Unable to connect to the server.");
            }
          },
        },
      ]
    );
  };

  const toggleGuardStatus = async (guard) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/guards/${guard._id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          `Guard ${data.data.isActive ? "activated" : "deactivated"}`
        );
        fetchGuards();
      } else {
        Alert.alert("Error", data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("❌ Toggle Status Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading guards...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#F1F5F9" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Manage Guards</Text>
            <Text style={styles.headerSubtitle}>
              {guards.length} guard{guards.length !== 1 ? "s" : ""} total
            </Text>
          </View>
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="#FFF" />
          </Pressable>
        </View>

        {/* Guards List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={["#3B82F6"]}
            />
          }
        >
          {guards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🛡️</Text>
              <Text style={styles.emptyTitle}>No Guards Added</Text>
              <Text style={styles.emptyText}>
                Tap the + button to add your first guard
              </Text>
            </View>
          ) : (
            guards.map((guard, index) => (
              <View key={guard._id || index} style={styles.guardCard}>
                <View style={styles.guardHeader}>
                  <View style={styles.guardInfo}>
                    <View style={styles.guardNameRow}>
                      <Text style={styles.guardName}>{guard.name}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: guard.isActive
                              ? "rgba(34,197,94,0.15)"
                              : "rgba(239,68,68,0.15)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: guard.isActive ? "#22C55E" : "#EF4444" },
                          ]}
                        >
                          {guard.isActive ? "Active" : "Inactive"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.guardDetail}>
                      <Ionicons name="mail-outline" size={14} color="#64748B" />
                      <Text style={styles.guardDetailText}>{guard.email}</Text>
                    </View>
                    {guard.phone && (
                      <View style={styles.guardDetail}>
                        <Ionicons
                          name="call-outline"
                          size={14}
                          color="#64748B"
                        />
                        <Text style={styles.guardDetailText}>
                          {guard.phone}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.guardActions}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: guard.isActive
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(34,197,94,0.1)",
                      },
                    ]}
                    onPress={() => toggleGuardStatus(guard)}
                  >
                    <Ionicons
                      name={guard.isActive ? "pause" : "play"}
                      size={16}
                      color={guard.isActive ? "#EF4444" : "#22C55E"}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: guard.isActive ? "#EF4444" : "#22C55E" },
                      ]}
                    >
                      {guard.isActive ? "Deactivate" : "Activate"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      { backgroundColor: "rgba(59,130,246,0.1)" },
                    ]}
                    onPress={() => openEditModal(guard)}
                  >
                    <Ionicons name="pencil" size={16} color="#3B82F6" />
                    <Text
                      style={[styles.actionButtonText, { color: "#3B82F6" }]}
                    >
                      Edit
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(guard)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMode ? "Edit Guard" : "Add New Guard"}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </Pressable>
              </View>

              <ScrollView
                style={styles.formScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter guard name"
                    placeholderTextColor="#64748B"
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="guard@example.com"
                    placeholderTextColor="#64748B"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    placeholderTextColor="#64748B"
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone: text })
                    }
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Password {editMode ? "(Leave blank to keep current)" : "*"}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      editMode ? "Enter new password" : "Enter password"
                    }
                    placeholderTextColor="#64748B"
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
                    secureTextEntry
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>
                    {editMode ? "Update" : "Add Guard"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  screen: {
    flex: 1,
    backgroundColor: "#0A0E1A",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1E293B",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    color: "#94A3B8",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
  guardCard: {
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
  guardHeader: {
    marginBottom: 12,
  },
  guardInfo: {
    flex: 1,
  },
  guardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  guardName: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  guardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  guardDetailText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  guardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalTitle: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "700",
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#0F172A",
    color: "#F1F5F9",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#334155",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "700",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});