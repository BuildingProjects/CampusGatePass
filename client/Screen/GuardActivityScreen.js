//---------------------Author Roshan---------------------------//
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GuardActivityScreen({ log }) {
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayLogs = log.filter(
      (entry) => new Date(entry.timestamp).toDateString() === today
    );
    const entries = todayLogs.filter(
      (entry) => entry.action === "entry"
    ).length;
    const exits = todayLogs.filter((entry) => entry.action === "exit").length;
    return { total: todayLogs.length, entries, exits };
  };

  const stats = getTodayStats();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.heading}>Activity Log</Text>
          <Text style={styles.subheading}>Track all student movements</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.totalCard]}>
            <Ionicons name='stats-chart' size={24} color='#3B82F6' />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Today's Scans</Text>
          </View>

          <View style={[styles.statCard, styles.entryCard]}>
            <Text style={styles.statIcon}>→</Text>
            <Text style={styles.statNumber}>{stats.entries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>

          <View style={[styles.statCard, styles.exitCard]}>
            <Text style={styles.statIcon}>←</Text>
            <Text style={styles.statNumber}>{stats.exits}</Text>
            <Text style={styles.statLabel}>Exits</Text>
          </View>
        </View>

        {/* Activity List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recent Activity</Text>
          {log.length > 0 && (
            <Text style={styles.listCount}>{log.length} records</Text>
          )}
        </View>

        <ScrollView
          style={styles.logList}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {log.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptyText}>
                Scanned records will appear here
              </Text>
            </View>
          ) : (
            log.map((entry, idx) => (
              <View key={idx} style={styles.logItem}>
                <View style={styles.logContent}>
                  {/* Profile Photo */}
                  <Image
                    source={{
                      uri:
                        entry.photo ||
                        "https://dummyimage.com/100x100/1E293B/64748B&text=?",
                    }}
                    style={styles.logPhoto}
                  />

                  {/* Student Info */}
                  <View style={styles.logInfo}>
                    <View style={styles.logNameRow}>
                      <Text style={styles.logName}>{entry.name}</Text>
                      {entry.valid && (
                        <Ionicons
                          name='checkmark-circle'
                          size={16}
                          color='#22C55E'
                        />
                      )}
                    </View>
                    <Text style={styles.logRoll}>Roll: {entry.roll}</Text>
                    <View style={styles.logTimeRow}>
                      <Ionicons name='time-outline' size={12} color='#64748B' />
                      <Text style={styles.logTime}>{entry.timestamp}</Text>
                    </View>
                  </View>

                  {/* Action Badge */}
                  <View style={styles.actionBadgeContainer}>
                    {entry.action ? (
                      <View
                        style={[
                          styles.actionBadge,
                          entry.action === "entry"
                            ? styles.entryBadge
                            : styles.exitBadge,
                        ]}
                      >
                        <Text style={styles.actionIcon}>
                          {entry.action === "entry" ? "→" : "←"}
                        </Text>
                        <Text style={styles.actionText}>
                          {entry.action === "entry" ? "Entry" : "Exit"}
                        </Text>
                      </View>
                    ) : (
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
                            styles.statusText,
                            { color: entry.valid ? "#22C55E" : "#EF4444" },
                          ]}
                        >
                          {entry.valid ? "Valid" : "Invalid"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Colored Bottom Border */}
                <View
                  style={[
                    styles.logBorder,
                    {
                      backgroundColor: entry.action
                        ? entry.action === "entry"
                          ? "#22C55E"
                          : "#EF4444"
                        : entry.valid
                        ? "#3B82F6"
                        : "#94A3B8",
                    },
                  ]}
                />
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
    backgroundColor: "#0A0E1A",
  },
  screen: {
    flex: 1,
    backgroundColor: "#0A0E1A",
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  heading: {
    color: "#F1F5F9",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subheading: {
    color: "#64748B",
    fontSize: 15,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  totalCard: {
    borderTopWidth: 3,
    borderTopColor: "#3B82F6",
  },
  entryCard: {
    borderTopWidth: 3,
    borderTopColor: "#22C55E",
  },
  exitCard: {
    borderTopWidth: 3,
    borderTopColor: "#EF4444",
  },
  statIcon: {
    fontSize: 24,
    color: "#F1F5F9",
    marginBottom: 4,
  },
  statNumber: {
    color: "#F1F5F9",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  listTitle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  listCount: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  logList: {
    flex: 1,
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
  logItem: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  logContent: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
  },
  logPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#334155",
  },
  logInfo: {
    flex: 1,
  },
  logNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  logName: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
  },
  logRoll: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  logTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logTime: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },
  actionBadgeContainer: {
    marginLeft: 8,
  },
  actionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  entryBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  exitBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  actionIcon: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
  },
  actionText: {
    color: "#F1F5F9",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  logBorder: {
    height: 3,
    width: "100%",
  },
});
