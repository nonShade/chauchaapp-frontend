import { useState, useEffect } from "react";
import { View, Text, SafeAreaView } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { APP_THEME } from "@/constants/themes";
import Header from "@/components/home/Header";

export default function TabLayout() {
  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    async function loadUser() {
      let userDataStr: string | null = null;
      if (typeof localStorage !== 'undefined') {
        userDataStr = localStorage.getItem('user');
      }
      if (!userDataStr) {
        try {
          userDataStr = await SecureStore.getItemAsync('user');
        } catch (e) {
        }
      }
      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr);
          if (user.first_name) {
            setUserName(user.first_name);
          }
        } catch (e) {
          console.error('Error parseando datos de usuario:', e);
        }
      }
    }
    loadUser();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => (
          <SafeAreaView style={{ backgroundColor: APP_THEME.card.background }}>
            <Header userName={userName} />
          </SafeAreaView>
        ),
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: APP_THEME.card.background,
          borderTopWidth: 0,
          height: 80,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingTop: 16,
          paddingBottom: 8,
          justifyContent: "center",
          paddingHorizontal: 16,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? APP_THEME.button.primary.background
                  : "transparent",
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 20,
                gap: 4,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? APP_THEME.card.border : "transparent",
                minWidth: 80,
              }}
            >
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={24}
                color={
                  focused
                    ? APP_THEME.button.primary.text
                    : APP_THEME.text.secondary
                }
              />
              <Text
                style={{
                  color: focused
                    ? APP_THEME.button.primary.text
                    : APP_THEME.text.secondary,
                  fontWeight: focused ? "bold" : "normal",
                  fontSize: 12,
                }}
              >
                Inicio
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Cartola",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? APP_THEME.button.primary.background
                  : "transparent",
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 20,
                gap: 4,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? APP_THEME.card.border : "transparent",
                minWidth: 80,
              }}
            >
              <Ionicons
                name={focused ? "wallet" : "wallet-outline"}
                size={24}
                color={
                  focused
                    ? APP_THEME.button.primary.text
                    : APP_THEME.text.secondary
                }
              />
              <Text
                style={{
                  color: focused
                    ? APP_THEME.button.primary.text
                    : APP_THEME.text.secondary,
                  fontWeight: focused ? "bold" : "normal",
                  fontSize: 12,
                }}
              >
                Cartola
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "Noticias",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? APP_THEME.button.primary.background
                  : "transparent",
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 20,
                gap: 4,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? APP_THEME.card.border : "transparent",
                minWidth: 80,
              }}
            >
              <Ionicons
                name={focused ? "newspaper" : "newspaper-outline"}
                size={24}
                color={
                  focused
                    ? APP_THEME.button.primary.text
                    : APP_THEME.text.secondary
                }
              />
              <Text
                style={{
                  color: focused
                    ? APP_THEME.button.primary.text
                    : APP_THEME.text.secondary,
                  fontWeight: focused ? "bold" : "normal",
                  fontSize: 12,
                }}
              >
                Noticias
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Aprender",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused
                  ? APP_THEME.button.primary.background
                  : "transparent",
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 20,
                gap: 4,
                borderWidth: focused ? 2 : 0,
                borderColor: focused ? APP_THEME.card.border : "transparent",
                minWidth: 80,
              }}
            >
              <Ionicons
                name={focused ? "school" : "school-outline"}
                size={24}
                color={
                  focused
                    ? APP_THEME.button.primary.text
                    : APP_THEME.text.secondary
                }
              />
              <Text
                style={{
                  color: focused
                    ? APP_THEME.button.primary.text
                    : APP_THEME.text.secondary,
                  fontWeight: focused ? "bold" : "normal",
                  fontSize: 12,
                }}
              >
                Aprender
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
