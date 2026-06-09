import apiClient from './apiClient';
import { AsyncTaskResponse, TaskStatusResponse, waitForTask } from './asyncTask';

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

async function triggerAnalyzeFull(): Promise<AsyncTaskResponse> {
  const response = await apiClient.post<AsyncTaskResponse>('/news/analyze-full');
  return response.data;
}

async function getAnalyzeStatus(taskId: string): Promise<TaskStatusResponse<AnalyzeFullResponse>> {
  const response = await apiClient.get<TaskStatusResponse<AnalyzeFullResponse>>(
    `/news/analyze/status/${taskId}`,
  );
  return response.data;
}

const normalizeMultiple = (items: (NewsAnalysis | AnalyzeFullNewsItem)[]): NewsAnalysis[] =>
  items.map(normalizeNewsAnalysis);

export const newsService = {
  async getTopics(): Promise<Topic[]> {
    try {
      const response = await apiClient.get<Topic[]>('/news/topics');
      return response.data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },

  async getExistingAnalyzedNews(): Promise<NewsAnalysis[]> {
    try {
      const response = await apiClient.get<NewsResponse>('/news/analyzed');
      if (response.data.success && response.data.analyses) {
        return normalizeMultiple(response.data.analyses);
      }
      return [];
    } catch (error) {
      console.error('Error fetching existing news:', error);
      return [];
    }
  },

  async getAnalyzedNews(): Promise<NewsAnalysis[]> {
    try {
      const existing = await this.getExistingAnalyzedNews();
      if (existing.length > 0) return existing;

      const { task_id } = await triggerAnalyzeFull();
      const result = await waitForTask<AnalyzeFullResponse>(
        task_id,
        (id) => `/news/analyze/status/${id}`,
      );

      if (result.analyses) {
        return normalizeMultiple(result.analyses);
      }

      return [];
    } catch (error) {
      console.error('Error fetching analyzed news:', error);
      throw error;
    }
  },

  async getNewsByTopic(topicId: string): Promise<NewsAnalysis[]> {
    try {
      const response = await apiClient.get<NewsResponse>('/news/analyzed', {
        params: { topic_id: topicId },
      });
      if (response.data.success && response.data.analyses) {
        return normalizeMultiple(response.data.analyses);
      }
      return [];
    } catch (error) {
      console.error('Error fetching news by topic:', error);
      throw error;
    }
  },

  async triggerAndWaitForAnalysis(): Promise<NewsAnalysis[]> {
    const { task_id } = await triggerAnalyzeFull();
    const result = await waitForTask<AnalyzeFullResponse>(
      task_id,
      (id) => `/news/analyze/status/${id}`,
    );
    if (result.analyses) {
      return normalizeMultiple(result.analyses);
    }
    return [];
  },
};
