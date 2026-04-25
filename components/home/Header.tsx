import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function Header({ userName = 'Usuario' }) {
  const router = useRouter();
  const initials = userName.substring(0, 1).toUpperCase();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.profileSection}
        onPress={() => router.push('/profile')}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.notificationBtn}>
        <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.greenPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  textBlock: {
    justifyContent: 'center',
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationBtn: {
    padding: 4,
  },
});
