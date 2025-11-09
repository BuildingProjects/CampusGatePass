//---------------------Author Roshan---------------------------//
import React, { useState } from "react";
import { Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

// Screens
import GuardScannerScreen from "./GuardScannerScreen";
import GuardActivityScreen from "./GuardActivityScreen";

const Tab = createBottomTabNavigator();

export default function GuardHome({ navigation }) {
  const [log, setLog] = useState([]);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "RoleSelector" }],
            })
          );
        },
      },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: "#1E293B", borderTopWidth: 0 },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94A3B8",
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Scanner") iconName = "qr-code-outline";
          else if (route.name === "Activity") iconName = "list-outline";
          else if (route.name === "Logout") iconName = "log-out-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name='Scanner'>
        {() => <GuardScannerScreen log={log} setLog={setLog} />}
      </Tab.Screen>

      <Tab.Screen name='Activity'>
        {() => <GuardActivityScreen log={log} />}
      </Tab.Screen>

      <Tab.Screen
        name='Logout'
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      >
        {() => null}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
