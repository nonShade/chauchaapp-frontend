import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NewsCard({
  data,
  onVerMas = () => { }
}: { data: { title: string, summary: string, affectsLabel: string } | null, onVerMas: () => void }) {

  if (!data) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="newspaper-outline" size={18} color="#10B981" />
        <Text style={styles.headerText}>Noticia del Dia</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{data.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{data.summary}</Text>

        <View style={styles.tag}>
          <Ionicons name="trending-up" size={16} color="#10B981" />
          <Text style={styles.tagText}>{data.affectsLabel}</Text>
        </View>

        <TouchableOpacity onPress={onVerMas} style={styles.linkRow}>
          <Text style={styles.linkText}>Ver mas noticias</Text>
          <Ionicons name="open-outline" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#064E3B',
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#022C22',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  body: {
    padding: 16,
    paddingTop: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 22,
  },
  description: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  tagText: {
    color: '#10B981',
    fontSize: 14,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  linkText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});
