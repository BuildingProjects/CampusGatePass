import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RoleSelector from "./Screen/RoleSelector";
import LoginScreen from "./Screen/LoginScreen";
import SignupScreen from "./Screen/SignupScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='RoleSelector'
        screenOptions={{
          headerShown: true,
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
          options={{ title: "" }}
        />
        <Stack.Screen
          name='LoginScreen'
          component={LoginScreen}
          options={{ headerShown: false }}
          // options={{ title: "Login" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
