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
      const response = await apiClient.get<NewsResponse>('/news/analyzed');
      if (response.data.success && response.data.analyses) {
        return response.data.analyses;
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
        return response.data.analyses;
      }
      return [];
    } catch (error) {
      console.error('Error fetching news by topic:', error);
      throw error;
    }
  },
};
