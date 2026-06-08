import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_THEME } from "@/constants/themes";
import Header from "@/components/home/Header";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { name: "index",  route: "/(tabs)",        icon: "grid"      as const, iconOut: "grid-outline"      as const, label: "Inicio"   },
  { name: "wallet", route: "/(tabs)/wallet",  icon: "wallet"    as const, iconOut: "wallet-outline"    as const, label: "Cartola"  },
  { name: "news",   route: "/(tabs)/news",    icon: "newspaper" as const, iconOut: "newspaper-outline" as const, label: "Noticias" },
  { name: "learn",  route: "/(tabs)/learn",   icon: "school"    as const, iconOut: "school-outline"    as const, label: "Aprender" },
];

function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (name: string) => {
    if (name === "index") {
      return !pathname.includes("wallet") && !pathname.includes("news") && !pathname.includes("learn");
    }
    return pathname.includes(name);
  };

  return (
    <View style={{
      flexDirection: "row",
      backgroundColor: APP_THEME.card.background,
      borderTopWidth: 0,
      height: 80 + insets.bottom,
      elevation: 10,
      paddingTop: 10,
      paddingBottom: insets.bottom + 8,
      paddingHorizontal: 8,
    }}>
      {TABS.map((tab) => {
        const focused = isActive(tab.name);
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.route as any)}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <View style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: focused ? APP_THEME.button.primary.background : "transparent",
              paddingVertical: 8,
              paddingHorizontal: focused ? 14 : 8,
              borderRadius: 20,
              gap: 3,
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? APP_THEME.card.border : "transparent",
            }}>
              <Ionicons
                name={focused ? tab.icon : tab.iconOut}
                size={22}
                color={focused ? APP_THEME.button.primary.text : APP_THEME.text.secondary}
              />
              <Text style={{
                color: focused ? APP_THEME.button.primary.text : APP_THEME.text.secondary,
                fontWeight: focused ? "bold" : "normal",
                fontSize: 11,
              }}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    async function loadUser() {
      let userDataStr: string | null = null;
      try {
        userDataStr = await AsyncStorage.getItem('user');
      } catch (e) {
        console.error('Error leyendo AsyncStorage:', e);
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
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: true,
        header: () => (
          <View style={{ backgroundColor: APP_THEME.card.background, paddingTop: insets.top }}>
            <Header userName={userName} />
          </View>
        ),
      }}
    >
      <Tabs.Screen name="index"   options={{ title: "Inicio"   }} />
      <Tabs.Screen name="wallet"  options={{ title: "Cartola"  }} />
      <Tabs.Screen name="news"    options={{ title: "Noticias" }} />
      <Tabs.Screen name="learn"   options={{ title: "Aprender" }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}