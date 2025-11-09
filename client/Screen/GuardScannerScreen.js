//---------------------Author Roshan---------------------------//
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

export default function GuardScannerScreen({ log, setLog }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [rawData, setRawData] = useState("");
  const [actionType, setActionType] = useState(null); // 'entry' or 'exit'

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = ({ data }) => {
    console.log("📦 Raw QR Data:", data);
    setRawData(data);
    setScanned(true);

    try {
      let parsed = null;
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = null;
      }

      const result = parsed
        ? {
            name: parsed.name || "Unknown",
            roll: parsed.rollNumber || "N/A",
            photo:
              parsed.profilePhoto ||
              "https://dummyimage.com/200x200/000/fff&text=No+Photo",
            valid: true,
            timestamp: new Date().toLocaleString(),
          }
        : {
            name: data.includes("Name:")
              ? data.split("\n")[0]?.replace("Name:", "").trim()
              : "Unknown",
            roll: data.includes("Roll:")
              ? data.split("\n")[1]?.replace("Roll:", "").trim()
              : "N/A",
            photo: "https://dummyimage.com/200x200/000/fff&text=No+Photo",
            valid: data.includes("Name:") || data.includes("Roll:"),
            timestamp: new Date().toLocaleString(),
          };

      setStudentData(result);
    } catch (error) {
      console.log("QR Parse Error:", error);
      Alert.alert("Invalid QR", "The scanned QR code is not valid.");
      setScanned(false);
    }
  };

  const handleAction = async (type) => {
    if (!studentData) {
      Alert.alert("Error", "No student data found. Please scan a QR first.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Error",
          "Authorization token missing. Please log in again."
        );
        return;
      }

      const payload = {
        rollNumber: studentData.roll,
        name: studentData.name,
        action: type.toUpperCase(), // "entry" or "exit"
      };
      console.log(payload);

      console.log("➡️ Sending log payload:", payload);

      const response = await fetch(`${API_BASE_URL}/api/log/createlog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log("⬅️ Raw Log API Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ JSON Parse Error:", err);
        Alert.alert("Server Error", "Invalid response format from backend.");
        return;
      }

      // Handle backend responses properly
      if (!response.ok || !data.success) {
        switch (data.message) {
          case "rollNumber, name and action are required":
            Alert.alert("Error", "Incomplete data. Try scanning again.");
            break;
          case "Authorization token missing":
            Alert.alert("Error", "Token missing. Please login again.");
            break;
          case "Invalid or expired token":
            Alert.alert("Session Expired", "Please log in again.");
            break;
          case "Access denied. Guards only.":
            Alert.alert("Access Denied", "Only guards can record logs.");
            break;
          default:
            Alert.alert("Error", data.message || "Failed to record log.");
        }
        return;
      }

      console.log("✅ Log created successfully:", data.data);
      setLog((prev) => [
        {
          ...studentData,
          action: type,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);

      Alert.alert("Success", `Log recorded: ${type.toUpperCase()}`, [
        { text: "OK", onPress: resetScanner },
      ]);
    } catch (error) {
      console.error("❌ Log API Error:", error);
      Alert.alert(
        "Network Error",
        "Unable to connect. Please check your internet or backend server."
      );
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setStudentData(null);
    setRawData("");
    setActionType(null);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#3B82F6' />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan student QR codes
          </Text>
          <Pressable style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.btnText}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {!scanned ? (
          <View style={styles.scannerContainer}>
            <View style={styles.header}>
              <Text style={styles.heading}>Guard Scanner</Text>
              <Text style={styles.subheading}>Scan student QR code</Text>
            </View>

            <View style={styles.cameraWrapper}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              <View style={styles.scannerOverlay}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
            </View>

            <View style={styles.hintContainer}>
              <Text style={styles.scanHint}>
                Position QR code within the frame
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.resultContainer}
            showsVerticalScrollIndicator={false}
          >
            {studentData && (
              <>
                <View style={styles.card}>
                  <View style={styles.photoContainer}>
                    <Image
                      source={{
                        uri:
                          studentData.photo ||
                          "https://dummyimage.com/200x200/000/fff&text=No+Photo",
                      }}
                      style={styles.profilePhoto}
                    />
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓</Text>
                    </View>
                  </View>

                  <Text style={styles.name}>{studentData.name}</Text>
                  <Text style={styles.roll}>Roll No: {studentData.roll}</Text>

                  <View style={styles.timeContainer}>
                    <Text style={styles.timeIcon}>🕐</Text>
                    <Text style={styles.time}>{studentData.timestamp}</Text>
                  </View>
                </View>

                <View style={styles.actionContainer}>
                  <Text style={styles.actionTitle}>Select Action</Text>
                  <View style={styles.buttonRow}>
                    <Pressable
                      style={[styles.actionBtn, styles.entryBtn]}
                      onPress={() => handleAction("entry")}
                    >
                      <Text style={styles.actionIcon}>→</Text>
                      <Text style={styles.actionBtnText}>Entry</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.actionBtn, styles.exitBtn]}
                      onPress={() => handleAction("exit")}
                    >
                      <Text style={styles.actionIcon}>←</Text>
                      <Text style={styles.actionBtnText}>Exit</Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable style={styles.scanAgainBtn} onPress={resetScanner}>
                  <Text style={styles.scanAgainText}>↻ Scan Another</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
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
  screen: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  scannerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    backgroundColor: "#0A0E1A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 15,
    marginTop: 15,
  },
  permissionCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  permissionIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  permissionTitle: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  permissionText: {
    color: "#94A3B8",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: "100%",
    elevation: 4,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  heading: {
    color: "#F1F5F9",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subheading: {
    color: "#64748B",
    fontSize: 16,
    textAlign: "center",
  },
  cameraWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1E293B",
    elevation: 10,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  cornerTL: {
    position: "absolute",
    top: 30,
    left: 30,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#3B82F6",
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: "absolute",
    top: 30,
    right: 30,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#3B82F6",
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: "absolute",
    bottom: 30,
    left: 30,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#3B82F6",
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#3B82F6",
    borderBottomRightRadius: 8,
  },
  hintContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  scanHint: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  resultContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#1E293B",
    width: "100%",
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 35,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 25,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: "#3B82F6",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#22C55E",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1E293B",
  },
  verifiedText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  name: {
    color: "#F1F5F9",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  roll: {
    color: "#94A3B8",
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 15,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  time: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  actionContainer: {
    width: "100%",
    marginBottom: 20,
  },
  actionTitle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  entryBtn: {
    backgroundColor: "#22C55E",
  },
  exitBtn: {
    backgroundColor: "#EF4444",
  },
  actionIcon: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
    marginRight: 8,
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  scanAgainBtn: {
    backgroundColor: "#334155",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#475569",
  },
  scanAgainText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 16,
  },
  btnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
