//---------------------Author Roshan---------------------------//

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ActionSheetIOS,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  API_BASE_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "@env";
import { CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileCompletionScreen({ navigation }) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const pickImage = async () => {
    console.log("Image Picking...");
    try {
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Take Photo", "Choose from Gallery"],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              const { status } =
                await ImagePicker.requestCameraPermissionsAsync();
              if (status !== "granted") {
                Alert.alert("Permission Denied", "Camera access is required.");
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled) {
                setPhotoUri(result.assets[0].uri);
              }
            } else if (buttonIndex === 2) {
              const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== "granted") {
                Alert.alert("Permission Denied", "Gallery access is required.");
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled) {
                setPhotoUri(result.assets[0].uri);
              }
            }
          }
        );
      } else {
        Alert.alert(
          "Upload Photo",
          "Choose an option",
          [
            {
              text: "Take Photo",
              onPress: async () => {
                const { status } =
                  await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                  Alert.alert(
                    "Permission Denied",
                    "Camera access is required."
                  );
                  return;
                }
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });
                if (!result.canceled) {
                  setPhotoUri(result.assets[0].uri);
                }
              },
            },
            {
              text: "Choose from Gallery",
              onPress: async () => {
                const { status } =
                  await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                  Alert.alert(
                    "Permission Denied",
                    "Gallery access is required."
                  );
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });
                if (!result.canceled) {
                  setPhotoUri(result.assets[0].uri);
                }
              },
            },
            { text: "Cancel", style: "cancel" },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "Something went wrong while picking the image.");
    }
  };

  const uploadToCloudinary = async (uri) => {
    try {
      setUploading(true);
      const data = new FormData();
      const filename = uri.split("/").pop();
      const type = `image/${filename.split(".").pop()}`;

      data.append("file", { uri, name: filename, type });
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();
      console.log("✅ Cloudinary upload result:", result);

      if (result.secure_url) return result.secure_url;
      throw new Error(result.error?.message || "Upload failed");
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      Alert.alert("Upload Failed", "Could not upload image to Cloudinary.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !rollNumber || !department || !batch || !photoUri) {
      Alert.alert(
        "Missing Fields",
        "Please fill all fields and upload a photo."
      );
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Token missing. Please log in again.");
        return;
      }

      const uploadedUrl = await uploadToCloudinary(photoUri);
      if (!uploadedUrl) return;

      const response = await fetch(
        `${API_BASE_URL}/api/student/completeprofile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            rollNumber: rollNumber.trim(),
            department: department.trim(),
            batch: Number(batch),
            profilePhoto: uploadedUrl,
          }),
        }
      );

      const text = await response.text();
      console.log("⬅️ Profile Response:", text);
      const data = JSON.parse(text);

      if (!response.ok || !data.success) {
        Alert.alert("Error", data.message || "Profile update failed.");
        return;
      }

      Alert.alert("Success! 🎉", "Profile completed successfully!");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "StudentHome" }],
        })
      );
    } catch (error) {
      console.error("Profile Completion Error:", error);
      Alert.alert("Network Error", "Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0A0E1A", "#1E293B"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
          >
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Ionicons name='person-outline' size={40} color='#3B82F6' />
                </View>
                <Text style={styles.heading}>Complete Your Profile</Text>
                <Text style={styles.subheading}>
                  Just a few more details to get started
                </Text>
              </View>

              {/* Profile Photo Upload */}
              <View style={styles.photoSection}>
                <Text style={styles.sectionLabel}>Profile Photo</Text>
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={pickImage}
                  disabled={uploading}
                >
                  {photoUri ? (
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: photoUri }}
                        style={styles.profileImage}
                      />
                      <View style={styles.editBadge}>
                        <Ionicons name='camera' size={16} color='#FFF' />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons
                        name='camera-outline'
                        size={32}
                        color='#64748B'
                      />
                      <Text style={styles.placeholderText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {uploading && (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator size='small' color='#3B82F6' />
                    <Text style={styles.uploadingText}>Uploading photo...</Text>
                  </View>
                )}
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "name" && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name='person-outline'
                      size={20}
                      color={focusedInput === "name" ? "#3B82F6" : "#64748B"}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Enter your full name'
                      placeholderTextColor='#64748B'
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setFocusedInput("name")}
                      onBlur={() => setFocusedInput(null)}
                      returnKeyType='next'
                    />
                  </View>
                </View>

                {/* Roll Number Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Roll Number</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "roll" && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name='card-outline'
                      size={20}
                      color={focusedInput === "roll" ? "#3B82F6" : "#64748B"}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='Enter your roll number'
                      placeholderTextColor='#64748B'
                      value={rollNumber}
                      onChangeText={setRollNumber}
                      onFocus={() => setFocusedInput("roll")}
                      onBlur={() => setFocusedInput(null)}
                      returnKeyType='next'
                    />
                  </View>
                </View>

                {/* Department Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Department</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "department" && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name='school-outline'
                      size={20}
                      color={
                        focusedInput === "department" ? "#3B82F6" : "#64748B"
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='e.g., Computer Science'
                      placeholderTextColor='#64748B'
                      value={department}
                      onChangeText={setDepartment}
                      onFocus={() => setFocusedInput("department")}
                      onBlur={() => setFocusedInput(null)}
                      returnKeyType='next'
                    />
                  </View>
                </View>

                {/* Batch Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Batch Year</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "batch" && styles.inputFocused,
                    ]}
                  >
                    <Ionicons
                      name='calendar-outline'
                      size={20}
                      color={focusedInput === "batch" ? "#3B82F6" : "#64748B"}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='e.g., 2024'
                      placeholderTextColor='#64748B'
                      keyboardType='numeric'
                      value={batch}
                      onChangeText={setBatch}
                      onFocus={() => setFocusedInput("batch")}
                      onBlur={() => setFocusedInput(null)}
                      returnKeyType='done'
                    />
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  { opacity: loading || uploading || pressed ? 0.8 : 1 },
                ]}
                onPress={handleSubmit}
                disabled={loading || uploading}
              >
                <LinearGradient
                  colors={["#22C55E", "#16A34A"]}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <ActivityIndicator size='small' color='#FFF' />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>
                        Complete Profile
                      </Text>
                      <Ionicons
                        name='checkmark-circle'
                        size={20}
                        color='#FFF'
                      />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.infoBadge}>
                  <Ionicons
                    name='information-circle'
                    size={16}
                    color='#64748B'
                  />
                  <Text style={styles.infoText}>
                    All information can be updated later
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  container: {
    paddingHorizontal: 24,
    marginTop: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59,130,246,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 8,
  },
  heading: {
    color: "#F1F5F9",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subheading: {
    color: "#94A3B8",
    fontSize: 15,
    textAlign: "center",
  },
  photoSection: {
    alignItems: "center",
  },
  sectionLabel: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#3B82F6",
  },
  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1E293B",
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: "#475569",
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "600",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadingText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#0F172A",
  },
  input: {
    flex: 1,
    color: "#F1F5F9",
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 12,
  },
  submitButton: {
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
    marginBottom: 24,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: "center",
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(100,116,139,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  infoText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
});
