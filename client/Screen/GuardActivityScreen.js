//---------------------Author Roshan---------------------------//
import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GuardActivityScreen({ log }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.heading}>Scan History</Text>

        <ScrollView
          style={styles.logList}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
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
                <View style={styles.logHeader}>
                  <View style={styles.logNameSection}>
                    <Ionicons
                      name={
                        entry.valid
                          ? "checkmark-circle"
                          : "close-circle-outline"
                      }
                      size={22}
                      color={entry.valid ? "#22C55E" : "#EF4444"}
                      style={{ marginRight: 8 }}
                    />
                    <View>
                      <Text style={styles.logName}>{entry.name}</Text>
                      <Text style={styles.logRoll}>{entry.roll}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: entry.valid
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(239,68,68,0.15)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.logStatus,
                        { color: entry.valid ? "#22C55E" : "#EF4444" },
                      ]}
                    >
                      {entry.valid ? "VALID" : "INVALID"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.logTime}>{entry.timestamp}</Text>
              </View>
            ))
          )}
        </ScrollView>
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
    paddingHorizontal: 20,
  },
  heading: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
    letterSpacing: 0.5,
    textShadowColor: "rgba(59,130,246,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  logList: { paddingHorizontal: 4 },
  logItem: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logNameSection: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  logName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  logRoll: { color: "#94A3B8", fontSize: 13 },
  logStatus: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  logTime: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  noLogText: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 60,
    fontSize: 15,
  },
});
