import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { APP_THEME } from '@/constants/themes';
import NewsCard from '@/components/home/NewsCard';
import { NewsSkeleton } from '@/components/home/NewsSkeleton';
import { newsService, Topic, NewsAnalysis } from '@/services/api/news';

export default function NoticiasScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [modalNews, setModalNews] = useState<NewsAnalysis | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [news, setNews] = useState<NewsAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load topics and news on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [topicsData, newsData] = await Promise.all([
        newsService.getTopics(),
        newsService.getAnalyzedNews(),
      ]);
      setTopics(topicsData);
      
      // Deduplicar noticias por news_id
      const uniqueNews = Array.from(
        new Map(newsData.map((item) => [item.news_id, item])).values()
      );
      setNews(uniqueNews);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  }

  // Build categories: "Todas" + all etiquetas from news
  const categories = useMemo(() => {
    const allTags = new Set<string>();
    news.forEach((n) => {
      n.etiquetas?.forEach((tag) => allTags.add(tag));
    });
    return ['Todas', ...Array.from(allTags).sort()];
  }, [news]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'Todas') return news;
    return news.filter((n) => n.etiquetas?.includes(selectedCategory));
  }, [selectedCategory, news]);

  function renderItem({ item }: { item: NewsAnalysis }) {
    return (
      <TouchableOpacity onPress={() => setModalNews(item)}>
        <NewsCard
          data={{
            title: item.titulo,
            summary: item.summary,
            affectsLabel: `Urgencia: ${item.nivel_urgencia}`,
            etiquetas: item.etiquetas,
            nivel_urgencia: item.nivel_urgencia,
            published_at: item.published_at,
          }}
          onVerMas={() => setModalNews(item)}
        />
      </TouchableOpacity>
    );
  }

  function renderSkeleton() {
    return (
      <>
        <NewsSkeleton />
        <NewsSkeleton />
        <NewsSkeleton />
      </>
    );
  }

  return (
    <View style={styles.container}>
      {/* Categories Header */}
      <View style={styles.headerRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {categories.map((c) => {
            const active = c === selectedCategory;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedCategory(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadData} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State with Skeleton */}
      {loading ? (
        <View style={styles.skeletonContainer}>{renderSkeleton()}</View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay noticias en esta categoría
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => `${item.news_id}_${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* News Detail Modal */}
      <Modal visible={!!modalNews} animationType="fade" transparent statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setModalNews(null)}>
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <View style={styles.impactBadgeContainer}>
                <Text
                  style={[
                    styles.impactBadge,
                    modalNews?.nivel_urgencia === 'alto' && styles.impactAlto,
                    modalNews?.nivel_urgencia === 'medio' &&
                      styles.impactMedio,
                    modalNews?.nivel_urgencia === 'bajo' && styles.impactBajo,
                  ]}
                >
                  {modalNews?.nivel_urgencia?.toUpperCase()}
                </Text>
              </View>
              <Pressable
                onPress={() => setModalNews(null)}
                style={styles.closeButton}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: APP_THEME.text.secondary,
                  }}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalTitle}>{modalNews?.titulo}</Text>
              <Text style={styles.modalMeta}>
                {modalNews?.source_url
                  ? new URL(modalNews.source_url).hostname
                  : 'Fuente'}{' '}
                • {modalNews?.published_at
                  ? new Date(modalNews.published_at).toLocaleDateString(
                      'es-CL'
                    )
                  : 'N/A'}
              </Text>
              <Text style={styles.modalSummary}>{modalNews?.summary}</Text>

              <View style={styles.tagsContainer}>
                {modalNews?.etiquetas?.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.analysisBox}>
                <Text style={styles.analysisTitle}>Análisis Personalizado</Text>
                <Text style={styles.analysisText}>
                  {modalNews?.analisis}
                </Text>
                {modalNews?.impacto_personal && (
                  <>
                    <Text style={[styles.analysisTitle, { marginTop: 12 }]}>
                      Tu Impacto Personal
                    </Text>
                    <Text style={styles.analysisText}>
                      {modalNews.impacto_personal}
                    </Text>
                  </>
                )}
              </View>

              {modalNews?.recomendacion && (
                <View style={styles.recommendationBox}>
                  <Text style={styles.recommendationTitle}>
                    Recomendación
                  </Text>
                  <Text style={styles.recommendationText}>
                    {modalNews.recomendacion}
                  </Text>
                </View>
              )}

              <Text style={styles.modalContent}>
                Analizado el{' '}
                {modalNews?.analizado_el
                  ? new Date(modalNews.analizado_el).toLocaleDateString(
                      'es-CL'
                    )
                  : 'N/A'}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.fullArticleButton}
              onPress={() => {
                if (modalNews?.source_url) {
                  Linking.openURL(modalNews.source_url).catch(() => {
                    alert('No se pudo abrir el enlace');
                  });
                }
              }}
            >
              <Text style={styles.fullArticleText}>
                Ver artículo completo
              </Text>
            </TouchableOpacity>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME.background.primary,
  },
  headerRow: {
    paddingVertical: 12,
  },
  chipsRow: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: APP_THEME.card.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  chipActive: {
    backgroundColor: APP_THEME.button.primary.background,
    borderColor: APP_THEME.card.border,
  },
  chipText: {
    color: APP_THEME.text.secondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: APP_THEME.button.primary.text,
  },

  // Error and Empty States
  errorContainer: {
    padding: 16,
    backgroundColor: '#2a1a1a',
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    color: '#ff6666',
    marginBottom: 12,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
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

  // Skeleton Loading
  skeletonContainer: {
    padding: 16,
    paddingBottom: 120,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 96,
  },
  modalCard: {
    backgroundColor: APP_THEME.background.primary,
    borderRadius: 28,
    width: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  impactBadgeContainer: {
    flex: 1,
  },
  impactBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 12,
    alignSelf: 'flex-start',
  },
  impactAlto: {
    backgroundColor: '#4a2222',
    color: '#ff6666',
  },
  impactMedio: {
    backgroundColor: '#4a3a22',
    color: '#ffaa44',
  },
  impactBajo: {
    backgroundColor: '#224a22',
    color: '#66ff66',
  },
  closeButton: {
    padding: 6,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    maxHeight: '72%',
  },
  modalTitle: {
    color: APP_THEME.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMeta: {
    color: APP_THEME.text.secondary,
    marginBottom: 12,
    fontSize: 13,
  },
  modalSummary: {
    color: APP_THEME.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: APP_THEME.cards.news.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  tagText: {
    color: APP_THEME.cards.news.accent,
    fontWeight: '600',
    fontSize: 12,
  },

  // Analysis Box
  analysisBox: {
    borderWidth: 1,
    borderColor: APP_THEME.card.border,
    backgroundColor: APP_THEME.cards.news.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  analysisTitle: {
    color: APP_THEME.cards.news.accent,
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 14,
  },
  analysisText: {
    color: APP_THEME.text.secondary,
    lineHeight: 20,
  },

  // Recommendation Box
  recommendationBox: {
    borderWidth: 1,
    borderColor: APP_THEME.button.primary.background,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  recommendationTitle: {
    color: APP_THEME.button.primary.background,
    fontWeight: '700',
    marginBottom: 6,
  },
  recommendationText: {
    color: APP_THEME.text.secondary,
    lineHeight: 20,
  },

  modalContent: {
    color: APP_THEME.text.primary,
    marginBottom: 12,
    fontSize: 12,
  },
  fullArticleButton: {
    padding: 16,
    backgroundColor: APP_THEME.button.primary.background,
    alignItems: 'center',
  },
  fullArticleText: {
    color: APP_THEME.button.primary.text,
    fontWeight: '700',
  },
});
