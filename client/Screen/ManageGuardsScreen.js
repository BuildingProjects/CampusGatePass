//---------------------Author Roshan---------------------------//
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
  Modal,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageGuardsScreen({ navigation }) {
  const [guards, setGuards] = useState([]);
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
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      // ✅ Use query parameter just like the fetchAdmins function
      const response = await fetch(
        `${API_BASE_URL}/api/admin/getemployees?role=${encodeURIComponent(
          "guard"
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();
      console.log("🔍 Fetch Guards Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        Alert.alert("Server Error", "Invalid response format from backend.");
        return;
      }

      // ✅ Handle backend errors clearly
      if (!response.ok || !data.success) {
        switch (data.message) {
          case "Authorization token missing":
            Alert.alert("Error", "Token missing. Please log in again.");
            break;
          case "Invalid or expired token":
            Alert.alert("Session Expired", "Please log in again.");
            break;
          case "Access denied. Admin only.":
            Alert.alert("Access Denied", "Only admins can view guard data.");
            break;
          case "Role is required (guard or admin)":
            Alert.alert("Error", "Role is required to fetch guards.");
            break;
          default:
            Alert.alert("Error", data.message || "Failed to fetch guards.");
        }
        return;
      }

      // ✅ Success — set data
      setGuards(data.data || []);
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
    setFormData({ name: "", email: "", phone: "", password: "" });
    setModalVisible(true);
  };

  const handleAddGuard = async () => {
    // 🔹 Validate form inputs
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert(
        "Validation Error",
        "Name, email, and password are required."
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      // 🔹 Check for token
      if (!token) {
        Alert.alert(
          "Authorization Error",
          "Authorization token missing. Please log in again."
        );
        return;
      }

      // 🔹 Prepare request body according to new API spec
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        employeeId: formData.employeeId.trim(), // You can customize this
        password: formData.password,
        role: "guard",
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
      console.log("🔍 Register Employee Raw Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ JSON Parse Error:", err);
        Alert.alert("Server Error", "Invalid response from the server.");
        return;
      }

      // 🔹 Handle backend-defined responses
      if (!response.ok || !data.success) {
        switch (data.message) {
          case "Authorization token missing":
            Alert.alert(
              "Error",
              "Authorization token missing. Please log in again."
            );
            break;

          case "Invalid or expired token":
            Alert.alert("Session Expired", "Please log in again.");
            break;

          case "Access denied. Admin only.":
            Alert.alert(
              "Access Denied",
              "Only admins can register new employees."
            );
            break;

          case "All fields (name, email, employeeId, password, role) are required":
            Alert.alert("Validation Error", "Please fill all required fields.");
            break;

          case "User with this email or employee ID already exists":
            Alert.alert(
              "Duplicate Entry",
              "A guard with this email or ID already exists."
            );
            break;

          default:
            Alert.alert("Error", data.message || "Something went wrong.");
        }
        return;
      }

      // ✅ Success
      Alert.alert("Success", "Guard registered successfully!");
      console.log("✅ Guard Registered:", data.data);

      setModalVisible(false);
      fetchGuards();
    } catch (error) {
      console.error("❌ Add Guard Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#3B82F6' />
        <Text style={styles.loadingText}>Loading guards...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name='arrow-back' size={24} color='#F1F5F9' />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Manage Guards</Text>
            <Text style={styles.headerSubtitle}>
              {guards.length} guard{guards.length !== 1 ? "s" : ""} total
            </Text>
          </View>
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Ionicons name='add' size={24} color='#FFF' />
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
              tintColor='#3B82F6'
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
                  <Text style={styles.guardName}>{guard.name}</Text>
                  <Text style={styles.guardEmail}>{guard.email}</Text>
                  {guard.phone && (
                    <Text style={styles.guardPhone}>📞 {guard.phone}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add Guard Modal */}
        <Modal
          visible={modalVisible}
          animationType='slide'
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add New Guard</Text>
                    <Pressable onPress={() => setModalVisible(false)}>
                      <Ionicons name='close' size={24} color='#94A3B8' />
                    </Pressable>
                  </View>

                  {/* Scrollable Form */}
                  <ScrollView
                    style={styles.formScroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                  >
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Full Name *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder='Enter guard name'
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
                        placeholder='guard@example.com'
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

                  {/* Buttons */}
                  <View style={styles.modalActions}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={styles.submitButton}
                      onPress={handleAddGuard}
                    >
                      <Text style={styles.submitButtonText}>Add Guard</Text>
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
  safeArea: { flex: 1, backgroundColor: "#0A0E1A" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0E1A",
  },
  loadingText: { color: "#94A3B8", marginTop: 12, fontSize: 15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1E293B",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { color: "#F1F5F9", fontSize: 22, fontWeight: "800" },
  headerSubtitle: { color: "#64748B", fontSize: 13, marginTop: 2 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
  emptyTitle: {
    color: "#94A3B8",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: { color: "#64748B", fontSize: 14, textAlign: "center" },
  guardCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  guardName: { color: "#F1F5F9", fontSize: 18, fontWeight: "700" },
  guardEmail: { color: "#94A3B8", fontSize: 14, marginTop: 4 },
  guardPhone: { color: "#64748B", fontSize: 13, marginTop: 2 },
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
  modalTitle: { color: "#F1F5F9", fontSize: 22, fontWeight: "700" },
  formScroll: { paddingHorizontal: 20, paddingTop: 20 },
  inputGroup: { marginBottom: 20 },
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
  cancelButtonText: { color: "#94A3B8", fontSize: 16, fontWeight: "700" },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  submitButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
