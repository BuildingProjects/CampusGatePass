import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StatusBar,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function RoleSelector({ navigation }) {
  const handleRoleSelect = (role) => {
    navigation.navigate("LoginScreen", { role });
  };

  const roles = [
    {
      name: "Student",
      icon: "school-outline",
      gradient: ["#3B82F6", "#2563EB"],
      description: "Access your digital pass",
      color: "#3B82F6",
    },
    {
      name: "Admin",
      icon: "shield-checkmark-outline",
      gradient: ["#8B5CF6", "#7C3AED"],
      description: "Manage campus system",
      color: "#8B5CF6",
    },
    {
      name: "Guard",
      icon: "scan-outline",
      gradient: ["#F59E0B", "#D97706"],
      description: "Scan and verify entries",
      color: "#F59E0B",
    },
  ];

  return (
    <LinearGradient colors={["#0A0E1A", "#1E293B"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle='light-content'
          translucent
          backgroundColor='transparent'
        />
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name='shield-checkmark' size={40} color='#3B82F6' />
              </View>
            </View>
            <Text style={styles.title}>Campus Gate Pass</Text>
            <Text style={styles.subtitle}>Select your role to continue</Text>
          </View>

          {/* Role Cards */}
          <View style={styles.cardsContainer}>
            {roles.map((role, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.roleCard,
                  pressed && styles.roleCardPressed,
                ]}
                onPress={() => handleRoleSelect(role.name)}
              >
                <LinearGradient
                  colors={[role.gradient[0] + "15", role.gradient[1] + "08"]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: role.color + "20" },
                      ]}
                    >
                      <Ionicons name={role.icon} size={32} color={role.color} />
                    </View>

                    <View style={styles.cardTextContainer}>
                      <Text style={styles.roleName}>{role.name}</Text>
                      <Text style={styles.roleDescription}>
                        {role.description}
                      </Text>
                    </View>

                    <View style={styles.arrowContainer}>
                      <Ionicons
                        name='chevron-forward'
                        size={24}
                        color='#64748B'
                      />
                    </View>
                  </View>

                  {/* Colored Bottom Border */}
                  <View
                    style={[styles.cardBorder, { backgroundColor: role.color }]}
                  />
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Secure Access System</Text>
            <View style={styles.footerDots}>
              <View style={[styles.dot, { backgroundColor: "#3B82F6" }]} />
              <View style={[styles.dot, { backgroundColor: "#8B5CF6" }]} />
              <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59,130,246,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(59,130,246,0.3)",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "500",
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    marginVertical: 40,
  },
  roleCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  roleCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardGradient: {
    backgroundColor: "#1E293B",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  roleName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  roleDescription: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBorder: {
    height: 4,
    width: "100%",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 10,
  },
  footerText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  footerDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
