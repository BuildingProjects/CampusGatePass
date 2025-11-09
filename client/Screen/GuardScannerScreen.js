//---------------------Author Roshan---------------------------//
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function GuardScannerScreen({ log, setLog }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    try {
      const lines = data.split("\n");
      const name = lines[0]?.replace("Name:", "").trim();
      const roll = lines[1]?.replace("Roll:", "").trim();
      const isValid = roll && roll.startsWith("22CS");

      const result = {
        name,
        roll,
        valid: isValid,
        timestamp: new Date().toLocaleString(),
      };

      setStudentData(result);
      setLog((prev) => [result, ...prev]);
    } catch {
      Alert.alert("Invalid QR", "The scanned QR code is not valid.");
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setStudentData(null);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#2563EB' />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Camera access is required to scan QR codes.
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {!scanned ? (
          <View style={styles.scannerContainer}>
            <Text style={styles.heading}>Scan Student QR</Text>

            <View style={styles.cameraWrapper}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            </View>

            <Text style={styles.scanHint}>Align QR within the frame</Text>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Ionicons
              name={studentData?.valid ? "checkmark-circle" : "close-circle"}
              size={80}
              color={studentData?.valid ? "#22C55E" : "#EF4444"}
            />
            <Text style={styles.resultText}>
              {studentData?.valid ? "Access Granted" : "Invalid QR"}
            </Text>

            {studentData && (
              <View style={styles.detailsBox}>
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name: </Text>
                  <Text style={styles.detailValue}>{studentData.name}</Text>
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Roll No: </Text>
                  <Text style={styles.detailValue}>{studentData.roll}</Text>
                </Text>
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time: </Text>
                  <Text style={styles.detailValue}>
                    {studentData.timestamp}
                  </Text>
                </Text>
              </View>
            )}

            <Pressable style={styles.scanAgainBtn} onPress={resetScanner}>
              <Text style={styles.btnText}>Scan Another QR</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scannerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#cbd5e1",
    fontSize: 15,
    textAlign: "center",
  },
  permissionBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 15,
  },
  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  cameraWrapper: {
    width: "90%",
    aspectRatio: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: "#3B82F6",
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  scanHint: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  resultText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginTop: 10,
  },
  detailsBox: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 14,
    width: "100%",
    marginVertical: 18,
    elevation: 3,
  },
  detailRow: { marginBottom: 8 },
  detailLabel: { color: "#94A3B8", fontSize: 15 },
  detailValue: { color: "#fff", fontSize: 16, fontWeight: "500" },
  scanAgainBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
