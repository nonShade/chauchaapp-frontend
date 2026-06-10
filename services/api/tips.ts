import { waitForTask } from './asyncTask';
import type { AsyncTaskResponse, TaskStatusResponse } from './asyncTask';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const getRootApiBaseUrl = (): string | null => {
  if (!API_BASE_URL) return null;
  return API_BASE_URL.replace(/\/v1\/?$/, '');
};

export interface DailyTip {
  daily_tip_id: string;
  title: string;
  text: string;
  category: string;
  day_of_week: number;
  generated_at: string;
  is_active: boolean;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const rootBaseUrl = getRootApiBaseUrl();
  if (!rootBaseUrl) throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured');

  const response = await fetch(`${rootBaseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export const tipsService = {
  async getTodayTip(): Promise<DailyTip | null> {
    try {
      return await apiFetch<DailyTip>('/tips/today');
    } catch (error) {
      console.error('Error fetching today tip:', error);
      return null;
    }
  },

  async getAllTips(): Promise<DailyTip[]> {
    try {
      const batch = await apiFetch<{ tips: DailyTip[] }>('/tips/all');
      return batch.tips;
    } catch (error) {
      console.error('Error fetching all tips:', error);
      return [];
    }
  },

  async generateAndWaitForTips(): Promise<DailyTip[]> {
    const { task_id } = await apiFetch<AsyncTaskResponse>('/tips/generate', {
      method: 'POST',
    });
    const result = await waitForTask<{ tips: DailyTip[] }>(
      task_id,
      (id) => `/tips/tasks/${id}`,
      undefined,
      getRootApiBaseUrl() ?? undefined,
    );
    return result.tips ?? [];
  },
};