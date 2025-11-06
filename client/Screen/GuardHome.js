import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function GuardHome() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // Request permission when screen opens
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setLoading(true);

    try {
      // Parse QR data
      const lines = data.split("\n");
      const name = lines[0]?.replace("Name: ", "").trim();
      const roll = lines[1]?.replace("Roll: ", "").trim();

      const isValid = roll && roll.startsWith("CSE2026"); // Example validation rule

      const result = {
        name,
        roll,
        valid: isValid,
        timestamp: new Date().toLocaleString(),
      };

      setStudentData(result);
      setLog((prev) => [result, ...prev]);
    } catch (error) {
      Alert.alert("Invalid QR", "The scanned QR code is not valid.");
    } finally {
      setLoading(false);
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
    <View style={styles.screen}>
      {!scanned ? (
        <>
          <Text style={styles.heading}>Scan Student QR</Text>
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
          </View>
          <Text style={styles.scanHint}>Align QR within the frame</Text>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Ionicons
            name={studentData?.valid ? "checkmark-circle" : "close-circle"}
            size={70}
            color={studentData?.valid ? "#22C55E" : "#EF4444"}
          />
          <Text style={styles.resultText}>
            {studentData?.valid ? "Access Granted ✅" : "Invalid QR ❌"}
          </Text>

          {studentData && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{studentData.name}</Text>

              <Text style={styles.detailLabel}>Roll No:</Text>
              <Text style={styles.detailValue}>{studentData.roll}</Text>

              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{studentData.timestamp}</Text>
            </View>
          )}

          <Pressable style={styles.scanAgainBtn} onPress={resetScanner}>
            <Text style={styles.btnText}>Scan Another QR</Text>
          </Pressable>
        </View>
      )}

      {/* Activity Log */}
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Recent Scans</Text>
        <ScrollView style={styles.logList}>
          {log.length === 0 ? (
            <Text style={styles.noLogText}>No scans yet</Text>
          ) : (
            log.map((entry, idx) => (
              <View
                key={idx}
                style={[
                  styles.logItem,
                  { borderLeftColor: entry.valid ? "#22C55E" : "#EF4444" },
                ]}
              >
                <Text style={styles.logName}>{entry.name}</Text>
                <Text style={styles.logRoll}>{entry.roll}</Text>
                <Text
                  style={[
                    styles.logStatus,
                    { color: entry.valid ? "#22C55E" : "#EF4444" },
                  ]}
                >
                  {entry.valid ? "Valid" : "Invalid"}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  permissionBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },
  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  cameraContainer: {
    flex: 0.6,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  scanHint: {
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20,
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 10,
  },
  detailsBox: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    width: "90%",
    marginVertical: 10,
  },
  detailLabel: {
    color: "#94A3B8",
    fontSize: 14,
  },
  detailValue: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
  },
  scanAgainBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  logContainer: {
    marginTop: 10,
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    flex: 0.35,
  },
  logTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  logList: {
    maxHeight: 150,
  },
  noLogText: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 10,
  },
  logItem: {
    paddingVertical: 8,
    borderLeftWidth: 4,
    paddingLeft: 10,
    marginBottom: 8,
    backgroundColor: "#0F172A",
    borderRadius: 8,
  },
  logName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  logRoll: {
    color: "#94A3B8",
    fontSize: 13,
  },
  logStatus: {
    fontSize: 13,
    fontWeight: "600",
  },
});
