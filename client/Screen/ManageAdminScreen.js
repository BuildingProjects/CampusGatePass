//---------------------Author Roshan---------------------------//
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageAdminScreen({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    password: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ Fetch all admins
  const fetchAdmins = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      // ✅ Use query parameter like in your getlog request
      const response = await fetch(
        `${API_BASE_URL}/api/admin/getemployees?role=${encodeURIComponent(
          "admin"
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();
      console.log("🔍 Fetch Admins Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        Alert.alert("Server Error", "Invalid response format from backend.");
        return;
      }

      // ✅ Handle backend responses properly
      if (!response.ok || !data.success) {
        switch (data.message) {
          case "Authorization token missing":
            Alert.alert("Error", "Token missing. Please log in again.");
            break;
          case "Invalid or expired token":
            Alert.alert("Session Expired", "Please log in again.");
            break;
          case "Access denied. Admin only.":
            Alert.alert("Access Denied", "Only admins can view admin data.");
            break;
          case "Role is required (guard or admin)":
            Alert.alert("Error", "Role is required to fetch admins.");
            break;
          default:
            Alert.alert("Error", data.message || "Failed to fetch admins.");
        }
        return;
      }

      // ✅ On success
      setAdmins(data.data || []);
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
    setFormData({ name: "", email: "", employeeId: "", password: "" });
    setModalVisible(true);
  };

  // ✅ Register Admin API call
  const handleAddAdmin = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.employeeId ||
      !formData.password
    ) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Authorization Error",
          "Token missing. Please log in again."
        );
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        employeeId: formData.employeeId.trim(),
        password: formData.password,
        role: "admin",
      };

      const response = await fetch(
        `${API_BASE_URL}/api/admin/registeremployee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      console.log("🔍 Register Admin Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        Alert.alert("Server Error", "Invalid response from backend.");
        return;
      }

      if (!response.ok || !data.success) {
        switch (data.message) {
          case "Authorization token missing":
            Alert.alert("Error", "Token missing. Please log in again.");
            break;
          case "Invalid or expired token":
            Alert.alert("Session Expired", "Please log in again.");
            break;
          case "Access denied. Admin only.":
            Alert.alert("Access Denied", "Only admins can add new admins.");
            break;
          case "User with this email or employee ID already exists":
            Alert.alert(
              "Duplicate",
              "Admin with this email or ID already exists."
            );
            break;
          default:
            Alert.alert("Error", data.message || "Something went wrong.");
        }
        return;
      }

      Alert.alert("Success", "Admin registered successfully!");
      setModalVisible(false);
      fetchAdmins();
    } catch (error) {
      console.error("❌ Add Admin Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  const handleDelete = (admin) => {
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
                  headers: { Authorization: `Bearer ${token}` },
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#8B5CF6' />
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

        {/* Admin List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
            admins.map((admin, index) => (
              <View key={admin._id || index} style={styles.adminCard}>
                <View style={styles.adminInfo}>
                  <Text style={styles.adminName}>{admin.name}</Text>
                  <Text style={styles.adminDetail}>{admin.email}</Text>
                  <Text style={[styles.adminDetail, { color: "#8B5CF6" }]}>
                    Administrator
                  </Text>
                </View>
                {/* <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(admin)}
                >
                  <Ionicons name='trash-outline' size={18} color='#EF4444' />
                </Pressable> */}
              </View>
            ))
          )}
        </ScrollView>

        {/* Add Admin Modal */}
        <Modal visible={modalVisible} animationType='slide' transparent>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1, justifyContent: "flex-end" }}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add New Admin</Text>
                    <Pressable onPress={() => setModalVisible(false)}>
                      <Ionicons name='close' size={24} color='#94A3B8' />
                    </Pressable>
                  </View>

                  <ScrollView style={styles.formScroll}>
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
                      <Text style={styles.inputLabel}>Email *</Text>
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
                      <Text style={styles.inputLabel}>Employee ID *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder='Enter unique employee ID'
                        placeholderTextColor='#64748B'
                        value={formData.employeeId}
                        onChangeText={(text) =>
                          setFormData({ ...formData, employeeId: text })
                        }
                        autoCapitalize='characters'
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Password *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder='Enter password'
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
                    <Pressable
                      style={styles.submitButton}
                      onPress={handleAddAdmin}
                    >
                      <Text style={styles.submitButtonText}>Add Admin</Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
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

  // ----- HEADER -----
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

  // ----- SCROLL & EMPTY STATE -----
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

  // ----- ADMIN CARD -----
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  adminDetail: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 2,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ----- MODAL -----
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

  // ----- BUTTONS -----
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
