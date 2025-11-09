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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  API_BASE_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "@env";
import { ActionSheetIOS, Platform } from "react-native";
import { CommonActions } from "@react-navigation/native";

export default function ProfileCompletionScreen({ navigation }) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    console.log("Image Picking...");
    try {
      // ✅ iOS Style Picker
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Take Photo", "Choose from Gallery"],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              // 📷 Camera
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
              // 🖼️ Gallery
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
                console.log(result.assets[0].uri);
              }
            }
          }
        );
      } else {
        // ✅ Android: Show options
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
                  console.log(result.assets[0].uri);
                }
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "Something went wrong while picking the image.");
    }
  };

  // ☁️ Upload to ImageKit
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

      // Upload image first
      const uploadedUrl = await uploadToCloudinary(photoUri);
      if (!uploadedUrl) return;

      // Send to backend
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

      Alert.alert("Success", "Profile completed successfully!");
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Complete Your Profile</Text>

      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Tap to upload photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {uploading && (
        <Text style={{ color: "#94A3B8", marginBottom: 15 }}>
          Uploading photo...
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder='Full Name'
        placeholderTextColor='#94A3B8'
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder='Roll Number'
        placeholderTextColor='#94A3B8'
        value={rollNumber}
        onChangeText={setRollNumber}
      />
      <TextInput
        style={styles.input}
        placeholder='Department'
        placeholderTextColor='#94A3B8'
        value={department}
        onChangeText={setDepartment}
      />
      <TextInput
        style={styles.input}
        placeholder='Batch'
        placeholderTextColor='#94A3B8'
        keyboardType='numeric'
        value={batch}
        onChangeText={setBatch}
      />

      <Pressable
        style={[styles.submitBtn, (loading || uploading) && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading || uploading}
      >
        {loading ? (
          <ActivityIndicator size='small' color='#fff' />
        ) : (
          <Text style={styles.btnText}>Save Profile</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 25,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#2563EB",
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  input: {
    width: "100%",
    backgroundColor: "#1E293B",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: "#10B981",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
