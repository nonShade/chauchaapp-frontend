import apiClient from './apiClient';

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface NewsAnalysis {
  news_id: string;
  titulo: string;
  summary: string;
  source_url: string;
  published_at: string;
  analisis: string;
  impacto_personal: string;
  recomendacion: string;
  nivel_urgencia: 'bajo' | 'medio' | 'alto';
  etiquetas: string[];
  analizado_el: string;
}

export interface NewsResponse {
  success: boolean;
  total_count: number;
  analyses: NewsAnalysis[];
}

export interface AnalyzeFullNewsItem {
  news_id: string;
  titulo: string;
  resumen: string;
  analisis: string;
  impacto_personal: string;
  recomendacion: string;
  nivel_urgencia: 'bajo' | 'medio' | 'alto';
  etiquetas: string[];
  fuente_url: string;
}

export interface AnalyzeFullResponse {
  success: boolean;
  analyzed_count: number;
  user_profile_summary?: Record<string, unknown>;
  analyses: AnalyzeFullNewsItem[];
  message?: string;
}

function normalizeNewsAnalysis(
  item: NewsAnalysis | AnalyzeFullNewsItem
): NewsAnalysis {
  return {
    news_id: item.news_id,
    titulo: item.titulo,
    summary: 'summary' in item ? item.summary : item.resumen,
    source_url: 'source_url' in item ? item.source_url : item.fuente_url,
    published_at: 'published_at' in item ? item.published_at : '',
    analisis: item.analisis,
    impacto_personal: item.impacto_personal,
    recomendacion: item.recomendacion,
    nivel_urgencia: item.nivel_urgencia,
    etiquetas: item.etiquetas ?? [],
    analizado_el: 'analizado_el' in item ? item.analizado_el : '',
  };
}

export const newsService = {
  // Get all news topics/categories
  async getTopics(): Promise<Topic[]> {
    try {
      const response = await apiClient.get<Topic[]>('/news/topics');
      return response.data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  // Get analyzed news for current user
  async getAnalyzedNews(): Promise<NewsAnalysis[]> {
    try {
      const analyzedResponse = await apiClient.get<NewsResponse>('/news/analyzed');
      const analyzedNews = analyzedResponse.data.success
        ? analyzedResponse.data.analyses ?? []
        : [];

      if (analyzedNews.length > 0) {
        return analyzedNews.map(normalizeNewsAnalysis);
      }

      const fullAnalysisResponse = await apiClient.post<AnalyzeFullResponse>(
        '/news/analyze-full'
      );

      if (fullAnalysisResponse.data.success && fullAnalysisResponse.data.analyses) {
        return fullAnalysisResponse.data.analyses.map(normalizeNewsAnalysis);
      }

      return [];
    } catch (error) {
      console.error('Error fetching analyzed news:', error);
      throw error;
    }
  },

  // Get news filtered by topic
  async getNewsByTopic(topicId: string): Promise<NewsAnalysis[]> {
    try {
      const response = await apiClient.get<NewsResponse>('/news/analyzed', {
        params: { topic_id: topicId },
      });
      if (response.data.success && response.data.analyses) {
        return response.data.analyses.map(normalizeNewsAnalysis);
      }
      return [];
    } catch (error) {
      console.error('Error fetching news by topic:', error);
      throw error;
    }
  },
};
