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

export default function ManageAdminScreen({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchAdmins();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUserId(data.data._id);
      }
    } catch (error) {
      console.error("❌ Fetch Current User Error:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAdmins(data.data || []);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch admins");
      }
    } catch (error) {
      console.error("❌ Fetch Admins Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdmins();
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedAdmin(null);
    setFormData({ name: "", email: "", phone: "", password: "" });
    setModalVisible(true);
  };

  const openEditModal = (admin) => {
    setEditMode(true);
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
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
      Alert.alert("Validation Error", "Password is required for new admins");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const url = editMode
        ? `${API_BASE_URL}/api/admin/admins/${selectedAdmin._id}`
        : `${API_BASE_URL}/api/admin/admins`;

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
          editMode ? "Admin updated successfully" : "Admin added successfully"
        );
        setModalVisible(false);
        fetchAdmins();
      } else {
        Alert.alert("Error", data.message || "Operation failed");
      }
    } catch (error) {
      console.error("❌ Submit Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  const handleDelete = (admin) => {
    if (admin._id === currentUserId) {
      Alert.alert("Error", "You cannot delete your own account");
      return;
    }

    Alert.alert(
      "Delete Admin",
      `Are you sure you want to remove ${admin.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${API_BASE_URL}/api/admin/admins/${admin._id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();
              if (response.ok && data.success) {
                Alert.alert("Success", "Admin removed successfully");
                fetchAdmins();
              } else {
                Alert.alert("Error", data.message || "Failed to delete admin");
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

  const toggleAdminStatus = async (admin) => {
    if (admin._id === currentUserId) {
      Alert.alert("Error", "You cannot deactivate your own account");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/admins/${admin._id}/toggle-status`,
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
          `Admin ${data.data.isActive ? "activated" : "deactivated"}`
        );
        fetchAdmins();
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
        <ActivityIndicator size='large' color='#3B82F6' />
        <Text style={styles.loadingText}>Loading admins...</Text>
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
            <Ionicons name='arrow-back' size={24} color='#F1F5F9' />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Manage Admins</Text>
            <Text style={styles.headerSubtitle}>
              {admins.length} admin{admins.length !== 1 ? "s" : ""} total
            </Text>
          </View>
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Ionicons name='add' size={24} color='#FFF' />
          </Pressable>
        </View>

        {/* Admins List */}
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
          {admins.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👨‍💼</Text>
              <Text style={styles.emptyTitle}>No Admins Added</Text>
              <Text style={styles.emptyText}>
                Tap the + button to add your first admin
              </Text>
            </View>
          ) : (
            admins.map((admin, index) => {
              const isCurrentUser = admin._id === currentUserId;
              return (
                <View key={admin._id || index} style={styles.adminCard}>
                  <View style={styles.adminHeader}>
                    <View style={styles.adminInfo}>
                      <View style={styles.adminNameRow}>
                        <Text style={styles.adminName}>{admin.name}</Text>
                        {isCurrentUser && (
                          <View style={styles.youBadge}>
                            <Text style={styles.youText}>You</Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: admin.isActive
                                ? "rgba(34,197,94,0.15)"
                                : "rgba(239,68,68,0.15)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: admin.isActive ? "#22C55E" : "#EF4444" },
                            ]}
                          >
                            {admin.isActive ? "Active" : "Inactive"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.adminDetail}>
                        <Ionicons
                          name='mail-outline'
                          size={14}
                          color='#64748B'
                        />
                        <Text style={styles.adminDetailText}>
                          {admin.email}
                        </Text>
                      </View>
                      {admin.phone && (
                        <View style={styles.adminDetail}>
                          <Ionicons
                            name='call-outline'
                            size={14}
                            color='#64748B'
                          />
                          <Text style={styles.adminDetailText}>
                            {admin.phone}
                          </Text>
                        </View>
                      )}
                      <View style={styles.adminDetail}>
                        <Ionicons
                          name='shield-checkmark-outline'
                          size={14}
                          color='#8B5CF6'
                        />
                        <Text
                          style={[styles.adminDetailText, { color: "#8B5CF6" }]}
                        >
                          Administrator
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.adminActions}>
                    <Pressable
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: admin.isActive
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(34,197,94,0.1)",
                          opacity: isCurrentUser ? 0.5 : 1,
                        },
                      ]}
                      onPress={() => toggleAdminStatus(admin)}
                      disabled={isCurrentUser}
                    >
                      <Ionicons
                        name={admin.isActive ? "pause" : "play"}
                        size={16}
                        color={admin.isActive ? "#EF4444" : "#22C55E"}
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          { color: admin.isActive ? "#EF4444" : "#22C55E" },
                        ]}
                      >
                        {admin.isActive ? "Deactivate" : "Activate"}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.actionButton,
                        { backgroundColor: "rgba(59,130,246,0.1)" },
                      ]}
                      onPress={() => openEditModal(admin)}
                    >
                      <Ionicons name='pencil' size={16} color='#3B82F6' />
                      <Text
                        style={[styles.actionButtonText, { color: "#3B82F6" }]}
                      >
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.deleteButton,
                        { opacity: isCurrentUser ? 0.5 : 1 },
                      ]}
                      onPress={() => handleDelete(admin)}
                      disabled={isCurrentUser}
                    >
                      <Ionicons
                        name='trash-outline'
                        size={18}
                        color='#EF4444'
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Add/Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType='slide'
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMode ? "Edit Admin" : "Add New Admin"}
                </Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name='close' size={24} color='#94A3B8' />
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
                    placeholder='Enter admin name'
                    placeholderTextColor='#64748B'
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
                    placeholder='admin@example.com'
                    placeholderTextColor='#64748B'
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    keyboardType='email-address'
                    autoCapitalize='none'
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder='Enter phone number'
                    placeholderTextColor='#64748B'
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone: text })
                    }
                    keyboardType='phone-pad'
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
                    placeholderTextColor='#64748B'
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
                    {editMode ? "Update" : "Add Admin"}
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
    backgroundColor: "#8B5CF6",
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
  adminCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  adminHeader: {
    marginBottom: 12,
  },
  adminInfo: {
    flex: 1,
  },
  adminNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  adminName: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
  },
  youBadge: {
    backgroundColor: "rgba(139,92,246,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  youText: {
    color: "#8B5CF6",
    fontSize: 11,
    fontWeight: "700",
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
  adminDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  adminDetailText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  adminActions: {
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
    backgroundColor: "#8B5CF6",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
