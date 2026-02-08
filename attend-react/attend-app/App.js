import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { NavigationTheme } from "./src/theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
} from "@expo-google-fonts/noto-sans-kr";
import { View, ActivityIndicator, Platform, Text } from "react-native";
import { COLORS } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import * as Font from "expo-font";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 64,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          padding: 6,
        },
        tabBarLabelStyle: {
          fontFamily: "Pretendard-Medium",
          fontSize: 12,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "QR코드",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Icon 
                name={focused ? "qrcode-scan" : "qrcode"} 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "프로필",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Icon 
                name={focused ? "account-circle" : "account-outline"} 
                size={24} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("./assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("./assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-Bold": require("./assets/fonts/Pretendard-Bold.otf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer theme={NavigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: "none",
        presentation: "card",
      }}
    >
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} options={{ animationEnabled: false }} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ animationEnabled: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ animationEnabled: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ animationEnabled: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
