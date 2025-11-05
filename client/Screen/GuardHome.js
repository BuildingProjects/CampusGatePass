import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function GuardHome() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>👮‍♂️ Welcome, Guard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
});
