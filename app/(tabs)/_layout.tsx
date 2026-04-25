import { View, Text, SafeAreaView } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import Header from '@/components/home/Header';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      header: () => (
        <SafeAreaView style={{ backgroundColor: Colors.background }}>
          <Header userName="Usuario" />
        </SafeAreaView>
      ),
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: Colors.background,
        borderTopWidth: 0,
        height: 70,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        paddingTop: 10,
      },
    }}>
      <Tabs.Screen name='index' options={{
        title: 'Inicio',
        tabBarIcon: ({ focused }) => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? Colors.greenPrimary : 'transparent',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            gap: 4
          }}>
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={24} color={focused ? '#0D0D0D' : Colors.textSecondary}
            />
            <Text style={{
              color: focused ? '#0D0D0D' : Colors.textSecondary,
              fontWeight: focused ? 'bold' : 'normal',
              fontSize: 12
            }}>
              Inicio
            </Text>
          </View>
        ),
      }} />
      <Tabs.Screen name='wallet' options={{
        title: 'Cartola',
        tabBarIcon: ({ focused }) => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? Colors.greenPrimary : 'transparent',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            gap: 4
          }}>
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={24} color={focused ? '#0D0D0D' : Colors.textSecondary}
            />
            <Text style={{
              color: focused ? '#0D0D0D' : Colors.textSecondary,
              fontWeight: focused ? 'bold' : 'normal',
              fontSize: 12
            }}>
              Cartola
            </Text>
          </View>
        ),
      }} />
      <Tabs.Screen name='news' options={{
        title: 'Noticias',
        tabBarIcon: ({ focused }) => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? Colors.greenPrimary : 'transparent',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            gap: 4
          }}>
            <Ionicons
              name={focused ? 'newspaper' : 'newspaper-outline'}
              size={24} color={focused ? '#0D0D0D' : Colors.textSecondary}
            />
            <Text style={{
              color: focused ? '#0D0D0D' : Colors.textSecondary,
              fontWeight: focused ? 'bold' : 'normal',
              fontSize: 12
            }}>
              Noticias
            </Text>
          </View>
        ),
      }} />
      <Tabs.Screen name='learn' options={{
        title: 'Aprender',
        tabBarIcon: ({ focused }) => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? Colors.greenPrimary : 'transparent',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            gap: 4
          }}>
            <Ionicons
              name={focused ? 'school' : 'school-outline'}
              size={24} color={focused ? '#0D0D0D' : Colors.textSecondary}
            />
            <Text style={{
              color: focused ? '#0D0D0D' : Colors.textSecondary,
              fontWeight: focused ? 'bold' : 'normal',
              fontSize: 12
            }}>
              Aprender
            </Text>
          </View>
        ),
      }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
