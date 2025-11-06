import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RoleSelector from "./Screen/RoleSelector";
import SignupScreen from "./Screen/SignupScreen";
import LoginScreen from "./Screen/LoginScreen";
import StudentHome from "./Screen/StudentHome";
import StudentProfile from "./Screen/StudentProfile";
import GuardHome from "./Screen/GuardHome";

// Screens

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='RoleSelector'
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#0F172A" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen
          name='RoleSelector'
          component={RoleSelector}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name='SignupScreen'
          component={SignupScreen}
          options={{ headerTitle: "" }} // ✅ keep header but hide title
        />

        <Stack.Screen
          name='LoginScreen'
          component={LoginScreen}
          options={{ headerTitle: "" }} // ✅ same here
        />

        {/* ✅ Add Student Home (with bottom tab navigation) */}
        <Stack.Screen
          name='StudentHome'
          component={StudentHome}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='GuardHome'
          component={GuardHome}
          options={{ headerShown: false }}
        />

        {/* ✅ Add Student Profile (in case you want direct access) */}
        <Stack.Screen
          name='StudentProfile'
          component={StudentProfile}
          options={{ headerTitle: "Edit Profile" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
