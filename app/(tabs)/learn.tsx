import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { APP_THEME } from '@/constants/themes';
import { getLearnModules } from '@/services/api/learnModules';
import { LearnModule } from '@/types/modulesTypes';

export default function AprenderScreen() {
  const router = useRouter();
  const [modules, setModules] = useState<LearnModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    try {
      setLoading(true);
      setError(null);
      const data = await getLearnModules();
      setModules(data);
    } catch (err) {
      console.error('Error cargando módulos:', err);
      setError('No se pudieron cargar los módulos. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }


  const renderModule = ({ item }: { item: LearnModule }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: '/learn-detail',
          params: { moduleSlug: item.slug },
        });
      }}
    >
      {/* Fila 1: Dificultad, Tiempo, Flecha */}
      <View style={styles.row1}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{item.level}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={14} color={APP_THEME.text.secondary} />
          <Text style={styles.timeText}>{item.estimatedTimeMinutes} min</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={APP_THEME.text.secondary} style={styles.arrow} />
      </View>

      {/* Fila 2: Título + Descripción */}
      <View style={styles.row2}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>

      {/* Fila 3: Temas + Preguntas */}
      <View style={styles.row3}>
        <View style={styles.topicsContainer}>
          <Ionicons name="book-outline" size={14} color={APP_THEME.text.secondary} />
          <Text style={styles.topicsText}>{item.topicsCount} temas</Text>
        </View>
        <View style={styles.questionsContainer}>
          <Ionicons name="bulb-outline" size={14} color="#3FD364" />
          <Text style={styles.questionsText}>{item.questionsCount} preguntas</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_THEME.button.primary.background} />
        <Text style={styles.loadingText}>Cargando módulos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadModules}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Módulos de aprendizaje</Text>
      {modules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay módulos disponibles por el momento.</Text>
        </View>
      ) : (
        <FlatList
          data={modules}
          keyExtractor={(item) => item.id}
          renderItem={renderModule}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  screenTitle: {
    color: APP_THEME.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: APP_THEME.card.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 24,
    marginBottom: 16,
    aspectRatio: 2,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Row 1: Difficulty, Time, Arrow
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(71, 214, 118, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#47D676',
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 'auto',
  },

  // Row 2: Title + Description
  row2: {
    gap: 3,
  },
  cardTitle: {
    color: APP_THEME.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  cardDescription: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
  },

  // Row 3: Topics + Questions
  row3: {
    flexDirection: 'row',
    gap: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topicsText: {
    color: APP_THEME.text.secondary,
    fontSize: 12,
  },
  questionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questionsText: {
    color: '#3FD364',
    fontSize: 12,
    fontWeight: '600',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: APP_THEME.text.primary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    backgroundColor: APP_THEME.button.primary.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: APP_THEME.button.primary.text,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: APP_THEME.text.secondary,
    fontSize: 16,
  },
});
